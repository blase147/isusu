import { Queue } from "bullmq";
import Redis from "ioredis";

// Ensure REDIS_URL is set, fallback to a placeholder if undefined
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("❌ REDIS_URL is not set! Please check your environment variables.");
  process.exit(1); // Stop execution if Redis URL is missing
}

console.log(`🔗 Connecting to Redis: ${redisUrl}`);

const redisClient = new Redis(redisUrl, {
  tls: redisUrl.startsWith("rediss://") ? {} : undefined, // Enable TLS for Upstash
  maxRetriesPerRequest: null, // Required for BullMQ
});

// Redis Event Listeners
redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Connected to Upstash Redis successfully");
});

// BullMQ Connection Using redisClient
const connection = redisClient;

// Example: Creating a BullMQ Queue
const myQueue = new Queue("myQueue", { connection });

export { redisClient, connection, myQueue };
export default redisClient;
