import { getActivePumps } from "./redis";
const WEBHOOK_ID =
	process.env.MODE === "DEV"
		? process.env.WEBHOOK_DEV_ID
		: process.env.WEBHOOK_ID;
const WEBHOOK_URL =
	process.env.MODE === "DEV"
		? process.env.WEBHOOK_DEV_URL
		: process.env.WEBHOOK_URL;
const HELIUS_KEY =
	process.env.MODE === "DEV"
		? process.env.HELIUS_DEV_KEY
		: process.env.HELIUS_KEY;

async function getPumpTokenInfo(contract_address: string) {
	const response = await fetch(
		`https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: "text",
				method: "getAsset",
				params: { id: contract_address },
			}),
		}
	);
	const data = await response.json();
	console.log(data.result);
	const metadata = data.result.content.metadata;
	const image = data.result.content.links.image;
	return {
		name: metadata.name,
		symbol: metadata.symbol,
		description: metadata.description,
		image: image,
	};
}
//useful methods getTokenSupply  getTokenLargestAccounts
async function updateWebhookAddresses() {
	const addresses = await getActivePumps();
	const response = await fetch(
		`https://api.helius.xyz/v0/webhooks/${WEBHOOK_ID}?api-key=${HELIUS_KEY}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				webhookUrl: WEBHOOK_URL,
				transactionTypes: ["TRANSFER", "SWAP"],
				accountAddresses: addresses,
				webhookType: "enhanced",
			}),
		}
	);
	const data = await response.json();
	if (data.error) {
		console.error("Error adding address to webhook:", data.error);
		return false;
	}
	console.log("Webhook EDITED response:", data);
	return true;
}

export { getPumpTokenInfo, updateWebhookAddresses };
