const geckoApi = "https://api.geckoTerminal.com/api/v2";

export async function getTokenDetails(token: string, network: string) {
	const tokenData = await fetch(
		`${geckoApi}/networks/${network}/tokens/${token}`
	);
	const tokenInfo = await fetch(
		`${geckoApi}/networks/${network}/tokens/${token}/info`
	);
	const tokenPools = await fetch(
		`${geckoApi}/networks/${network}/tokens/${token}/pools`
	);

	if (!tokenData || !tokenInfo || !tokenPools) {
		throw Error(`Token ${token} not found`);
	}
	const geckoData = await tokenData.json();
	const geckoInfo = await tokenInfo.json();
	const geckoPools = await tokenPools.json();
	if (geckoData.data && geckoInfo.data && geckoPools.data) {
		return {
			name: geckoData.data.attributes.name,
			description: geckoInfo.data.attributes.description,
			symbol: geckoData.data.attributes.symbol,
			price: geckoData.data.attributes.price_usd,
			volume: geckoData.data.attributes.volume_usd.h24,
			pool: geckoPools.data.map((pool: any) => pool.attributes.address)[0],
			poolName: geckoPools.data.map((pool: any) => pool.attributes.name)[0],
			poolDex: geckoPools.data.map(
				(pool: any) => pool.relationships.dex.data.id
			)[0],
			twitter: geckoInfo.data.attributes.twitter_handle,
			telegram: geckoInfo.data.attributes.telegram_handle,
			website: geckoInfo.data.attributes.websites[0],
		};
	}
}
export async function getTopPools(network: string) {
	const topPools = await fetch(`${geckoApi}/networks/${network}/pools`);
	if (!topPools) {
		throw Error(`Top pools not found`);
	}
	const geckoPools = await topPools.json();
	if (geckoPools.data) {
		const data: {
			ca: string;
			name: string;
			volume: string;
			price_change: string;
		}[] = geckoPools.data.map((pool: any) => ({
			ca: pool.attributes.address,
			name: pool.attributes.name,
			volume: pool.attributes.volume_usd.h24,
			price_change: pool.attributes.price_change_percentage.h24,
		}));

		return data;
	}
}

//gives token description
//gives token pools
//.data.attributes.address,
