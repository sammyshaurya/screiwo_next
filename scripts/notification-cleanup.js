import dotenv from 'dotenv';
import { cleanupNotificationInbox } from '../app/lib/notifications/pipeline.js';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

await cleanupNotificationInbox();
process.exit(0);
