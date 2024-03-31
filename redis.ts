import * as dotenv from "dotenv";
import { Redis } from "ioredis";
dotenv.config();

const client = new Redis(process.env.UPSTASH_URL);

const setRedis = async (key: string, value: string) => {
	client.set(key, value);
};

const getRedis = async (key: string) => {
	return client.get(key);
};

export { setRedis, getRedis };
