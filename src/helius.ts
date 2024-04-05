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

export { getPumpTokenInfo };
