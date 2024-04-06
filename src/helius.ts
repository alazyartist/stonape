import { getActivePumps } from "./redis";

async function getPumpTokenInfo(contract_address: string) {
	const response = await fetch(
		`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_KEY}`,
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
		`https://api.helius.xyz/v0/webhooks/${process.env.WEBHOOK_ID}?api-key=${process.env.HELIUS_KEY}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				webhookUrl: "https://b1a6-24-8-13-244.ngrok-free.app",
				transactionTypes: ["TRANSFER"],
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
