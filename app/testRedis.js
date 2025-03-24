import "dotenv/config";
import Redis from "ioredis";

if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not defined");
}
const redis = new Redis(process.env.REDIS_URL); // Vercel provides this

async function testRedis() {
    try {
        await redis.set("test", "Hello, Redis!"); // Set a test key
        const value = await redis.get("test"); // Get the value
        console.log("Redis Test Value:", value);
    } catch (error) {
        console.error("Redis Connection Error:", error);
    } finally {
        redis.disconnect();
    }
}

testRedis();
