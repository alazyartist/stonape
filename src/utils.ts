import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import { storeSolanaPrice, getSolanaPrice,client } from "./redis";
function convertToK(value: string) {
	if (parseFloat(value) < 1000) return value;
	if (parseFloat(value) < 1_000_000) {
		return `${(parseFloat(value) / 1000).toFixed(2)}K`;
	}
	if (parseFloat(value) < 1_000_000_000) {
		return `${(parseFloat(value) / 1_000_000).toFixed(2)}M`;
	}
}
async function getSolPriceGecko() {
	const PRICE_OF_SOL = await getSolanaPrice();
	if (PRICE_OF_SOL !== "null" && PRICE_OF_SOL !== null) {
		return parseFloat(PRICE_OF_SOL);
	}
	if (!PRICE_OF_SOL || PRICE_OF_SOL === "null") {
		const data = await fetch(
			"https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price/So11111111111111111111111111111111111111112"
		);
		const json = await data.json();
		const solPrice =
			json?.data?.attributes?.token_prices
				.So11111111111111111111111111111111111111112;
		await storeSolanaPrice(solPrice);
		return solPrice;
	}
}

async function calculateMarketCap(solTraded: number, tokensReceived: number) {
	const solPrice = await getSolPriceGecko();
	const TOTAL_TOKENS = 1_000_000_000;
	const perToken = solTraded / tokensReceived;
	const marketCapSol = perToken * TOTAL_TOKENS;
	if (!solPrice) return "Math is Hard Sometimes 🤷‍♂️";
	const marketCap = marketCapSol * solPrice;
	return `${(marketCap / 1_000).toFixed(2)}k`;
}

async function calculateBondingCurve(
	address: PublicKey,
	owner_addr: PublicKey,
	program_id: PublicKey
) {
	try {
		const token_addr = new PublicKey(address);
		const owner = new PublicKey(owner_addr);
		const PROGRAM_ID = new PublicKey(program_id);
		const token_address_key=token_addr.toBase58();
		const token_addr_cache = client.get(token_address_key, (err, data) => {
			if (err) console.error(err);
			else {console.log("TOKEN_INFO from redis", token_address_key, data)
				return data
			};)

		const connection = new Connection(clusterApiUrl("mainnet-beta"));
		let token_account = await connection.getParsedTokenAccountsByOwner(owner, {
			mint: token_addr,
		});
		const token_account_addr = token_account.value[0].pubkey;
		console.log("tokenaccount", token_account.value[0].pubkey);
		const token_supply = await connection.getTokenAccountBalance(
			token_account_addr
		);
		console.log("token_supply", token_supply);

		const total_supply = token_supply.value.uiAmount!;
		console.log(total_supply);
		const bonding_percent =
			(1 - (total_supply - 204_000_000) / 800_000_000) * 100;
		console.log(bonding_percent);
		return {
			bonding_percent,
			progress_bar: generateBondingCurveProgress(bonding_percent),
		};
	} catch (err) {
		console.log(err);
	}
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
	percent = Math.round(percent);
	if (percent < 10) {
		return "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜";
	} else if (percent < 20) {
		return "🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜";
	} else if (percent < 30) {
		return "🟩🟩⬜⬜⬜⬜⬜⬜⬜⬜";
	} else if (percent < 40) {
		return "🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜";
	} else if (percent < 50) {
		return "🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜";
	} else if (percent < 60) {
		return "🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜";
	} else if (percent < 70) {
		return "🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜";
	} else if (percent < 80) {
		return "🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜";
	} else if (percent < 90) {
		return "🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜";
	} else if (percent < 100) {
		return "🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜";
	} else if (percent >= 100) {
		return "🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩";
	} else {
		return "Hmmm...";
	}
}

export {
	convertToK,
	calculateMarketCap,
	isSolanaAddress,
	calculateBondingCurve,
	generateBondingCurveProgress,
};
