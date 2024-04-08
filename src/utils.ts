import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
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
	const connection = new Connection(clusterApiUrl("mainnet-beta"));
	const token = new PublicKey(address);
	const token_supply = await connection.getTokenSupply(token);
	const whales = await connection.getTokenLargestAccounts(token);
	const total_supply = token_supply.value.uiAmount;
	//get remaining tokens
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
function generateBondingCurveProgress(percent: number) {
	switch (true) {
		case percent >= 0 && percent <= 9:
			return "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜";
		case percent >= 10 && percent <= 19:
			return "🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜";
		case percent >= 20 && percent <= 29:
			return "🟩🟩⬜⬜⬜⬜⬜⬜⬜⬜";
		case percent >= 30 && percent <= 39:
			return "🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜";
		case percent >= 40 && percent <= 49:
			return "🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜";
		case percent >= 50 && percent <= 59:
			return "🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜";
		case percent >= 60 && percent <= 69:
			return "🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜";
		case percent >= 70 && percent <= 79:
			return "🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜";
		case percent >= 80 && percent <= 89:
			return "🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜";
		case percent >= 90 && percent <= 99:
			return "🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜";
		case percent === 100:
			return "🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩";
		default:
			return "Hmmm...";
	}
}
export { convertToK, calculateMarketCap, isSolanaAddress };
