import { PublicKey } from "@solana/web3.js";
function convertToK(value: string) {
	if (parseFloat(value) < 1000) return value;
	if (parseFloat(value) < 1_000_000) {
		return `${(parseFloat(value) / 1000).toFixed(2)}K`;
	}
	if (parseFloat(value) < 1_000_000_000) {
		return `${(parseFloat(value) / 1_000_000).toFixed(2)}M`;
	}
}

async function calculateMarketCap(solTraded: number, tokensReceived: number) {
	const TOTAL_TOKENS = 1_000_000_000;
	const perToken = solTraded / tokensReceived;
	const marketCapSol = perToken * TOTAL_TOKENS;
	const data = await fetch(
		"https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price/So11111111111111111111111111111111111111112"
	);
	const json = await data.json();
	const solPrice =
		json.data.attributes.token_prices
			.So11111111111111111111111111111111111111112;
	const marketCap = marketCapSol * solPrice;
	return `${(marketCap / 1_000).toFixed(2)}k`;
}

async function calculateBondingCurve(address: string) {
	//TODO:
	//1- (remainging tokens -204_000_000)/800_000_000
}

function isSolanaAddress(address: string) {
	try {
		new PublicKey(address);
		return true;
	} catch (e) {
		return false;
	}
}
export { convertToK, calculateMarketCap, isSolanaAddress };
