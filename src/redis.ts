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
async function storePumpData(contract_address: string, chat_id: number) {
	await client.hset(
		contract_address,
		{ chat_id: chat_id.toString() },
		(err, res) => {
			if (err) {
				console.log(err);
			}
			console.log(res);
		}
	);
}

async function getPumpData(contractAddress: string) {
	const data = await client.hgetall(contractAddress, (err, data) => {
		if (err) console.error(err);
		else console.log("Data for", contractAddress, data);
	});
	return data;
}
async function getChatId(contractAddress: string) {
	const data = await client.hget(contractAddress, "chat_id", (err, data) => {
		if (err) console.error(err);
		else console.log("Data for", contractAddress, data);
	});
	return Promise.resolve(data);
}

export { setRedis, getRedis, storePumpData, getPumpData, getChatId };
