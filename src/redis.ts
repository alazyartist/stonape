import * as dotenv from "dotenv";
import { Redis } from "ioredis";
import { updateWebhookAddresses } from "./helius";
dotenv.config();

const client = new Redis(process.env.UPSTASH_URL);

const setRedis = async (key: string, value: string) => {
	client.set(key, value);
};

const getRedis = async (key: string) => {
	return client.get(key);
};
async function storePumpData(
	contract_address: string,
	chat_id: number,
	group_name: string
) {
	await client.sadd("active_pumps", contract_address);
	await client.hset(
		contract_address,
		{ chat_id: chat_id.toString(), group_name: group_name },
		(err, res) => {
			if (err) {
				console.log(err);
			}
			console.log(res);
		}
	);

	await client.expire(contract_address, 864000);
	await client.expire("active_pumps", 864000);
}
async function extendTime(contract_address: string) {
	await client.expire(contract_address, 864000);
	await client.expire("active_pumps", 864000);
}
async function storeTokenInfo(contract_address: string, token_info: any) {
	await client.hset(
		contract_address,
		{ token_info: JSON.stringify(token_info) },
		(err, res) => {
			if (err) {
				console.log(err);
			}
			console.log(res);
		}
	);
	await client.expire(contract_address, 500);
}
async function getTokenInfo(contract_address: string) {
	const data = await client.hget(
		contract_address,
		"token_info",
		(err, data) => {
			if (err) console.error(err);
			// else console.log("TOKEN_INFO from redis", contract_address, data);
		}
	);
	return data;
}

async function getPumpData(contractAddress: string) {
	const data = await client.hgetall(contractAddress, (err, data) => {
		if (err) console.error(err);
		else console.log("PumpData fromRedis", contractAddress, data);
	});
	return data;
}
async function getChatId(contractAddress: string) {
	const data = await client.hget(contractAddress, "chat_id", (err, data) => {
		if (err) console.error(err);
		else console.log("chat_id from reids", contractAddress, data);
	});
	return Promise.resolve(data);
}
async function getGroupName(contractAddress: string) {
	const data = await client.hget(contractAddress, "group_name", (err, data) => {
		if (err) console.error(err);
		else console.log("group_name from reids", contractAddress, data);
	});
	return Promise.resolve(data);
}

async function getActivePumps() {
	// const data = await client.keys("*", (err, data) => {
	// 	if (err) console.error(err);
	// 	else console.log("Data for", data);
	// });
	// return data;
	const data = await client.smembers("active_pumps", (err, data) => {
		if (err) console.error(err);
		else console.log("Data for", data);
	});
	return data;
}
async function clearPumpData(contractAddress: string) {
	await client.del(contractAddress);
	await client.srem("active_pumps", contractAddress);
	updateWebhookAddresses();
}
async function storeSolanaPrice(price: number) {
	if (!price) return;
	if (price === null) return;
	await client.set("solana_price", price.toString());
	await client.expire("solana_price", 540);
}
async function getSolanaPrice() {
	const data = await client.get("solana_price", (err, data) => {
		if (err) console.error(err);
		else console.log("Solana PRICE:", data);
	});
	return data;
}

export {
	client,
	setRedis,
	getRedis,
	storePumpData,
	getPumpData,
	getChatId,
	getActivePumps,
	getTokenInfo,
	storeTokenInfo,
	storeSolanaPrice,
	getSolanaPrice,
	clearPumpData,
	extendTime,
	getGroupName,
};
