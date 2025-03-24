import { Queue } from "bullmq";
import Redis from "ioredis";

// Ensure REDIS_URL is defined, fallback to Upstash Redis URL
const redisClient = new Redis(process.env.REDIS_URL || "default_redis_url", {
  tls: {}, // Enable TLS for Upstash (since URL starts with "rediss://")
  maxRetriesPerRequest: null, // Required for BullMQ
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Upstash Redis successfully");
});

// BullMQ connection settings
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS ? {} : undefined,
};

// Example: Creating a BullMQ Queue
const myQueue = new Queue("myQueue", { connection });

export { redisClient, connection, myQueue };
export default redisClient;
