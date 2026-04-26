import dotenv from "dotenv";
import http from "node:http";
import { Server } from "socket.io";
import IORedis from "ioredis";
import { verifySocketToken } from "../app/lib/socketAuth.js";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const port = Number(process.env.SOCKET_SERVER_PORT || 3001);
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("REDIS_URL is required to run the websocket server.");
  process.exit(1);
}

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

const redisSubscriber = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const payload = verifySocketToken(token);

  if (!payload?.userId) {
    return next(new Error("Unauthorized"));
  }

  socket.data.userId = payload.userId;
  return next();
});

io.on("connection", (socket) => {
  const userRoom = `user:${socket.data.userId}`;
  socket.join(userRoom);

  socket.emit("connected", {
    userId: socket.data.userId,
    room: userRoom,
  });
});

redisSubscriber.psubscribe("notifications:*").catch((error) => {
  console.error("Failed to subscribe to notification channels:", error);
  process.exit(1);
});

redisSubscriber.on("pmessage", (pattern, channel, message) => {
  if (pattern !== "notifications:*") {
    return;
  }

  const recipientId = channel?.split(":")?.[1];
  if (!recipientId) {
    return;
  }

  let payload = null;
  try {
    payload = JSON.parse(message);
  } catch (error) {
    payload = { raw: message };
  }

  io.to(`user:${recipientId}`).emit("notification:new", {
    recipientId,
    channel,
    payload,
  });
});

server.listen(port, () => {
  console.log(`Socket server listening on http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await redisSubscriber.quit();
  io.close();
  server.close(() => process.exit(0));
});

process.on("SIGTERM", async () => {
  await redisSubscriber.quit();
  io.close();
  server.close(() => process.exit(0));
});
