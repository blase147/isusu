import Redis from "ioredis";

// Ensure REDIS_URL is defined, fallback to local Redis instance if undefined
export const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT || "redis://localhost:6379"),
});
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully");
});

export default redisClient;
