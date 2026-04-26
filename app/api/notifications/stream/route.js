import { auth } from '@clerk/nextjs/server';
import IORedis from 'ioredis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!process.env.REDIS_URL) {
    return new Response('Redis not configured', { status: 503 });
  }

  const encoder = new TextEncoder();
  const subscriber = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  const channel = `notifications:${userId}`;

  const stream = new ReadableStream({
    start(controller) {
      const send = (eventName, data) => {
        controller.enqueue(
          encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      send('connected', { ok: true });

      const handleMessage = (receivedChannel, message) => {
        if (receivedChannel !== channel) {
          return;
        }

        send('notification', {
          channel: receivedChannel,
          message,
        });
      };

      subscriber.on('message', handleMessage);

      subscriber.subscribe(channel).catch((error) => {
        send('error', { message: error.message });
      });

      controller._cleanup = () => {
        subscriber.off('message', handleMessage);
        subscriber.disconnect();
      };
    },
    cancel() {
      subscriber.disconnect();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
