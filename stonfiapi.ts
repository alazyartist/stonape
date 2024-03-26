import TonWeb from "tonweb";
import { Address, beginCell } from "@ton/core";
import { TonClient, JettonMaster } from "@ton/ton";
import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from "@ston-fi/sdk";

export async function getStonFiData(contract_address: string) {
	const provider = new TonWeb.HttpProvider(
		"https://toncenter.com/api/v2/jsonRPC",
		{
			apiKey: process.env.TONCENTER_TOKEN,
		}
	);

	const geckoApiBase = "https://api.geckoterminal.com/api/v2";

	const router = new Router(provider, {
		revision: ROUTER_REVISION.V1,
		address: ROUTER_REVISION_ADDRESS.V1,
	});

	const client = new TonClient({
		endpoint: "https://toncenter.com/api/v2/jsonRPC",
	});

	// const jettonMasterAddress = Address.parse(
	// 	"EQDN11TTPTxw_xSPJs_zyrzIRml4JXDlppAmYzJq--tmpA6V"
	// );
	const jettonMasterAddress = Address.parse(contract_address);
	const jettonMaster = client.open(JettonMaster.create(jettonMasterAddress));
	const jettonData = await jettonMaster.getJettonData();
	// console.log(jettonData.content, "is the jetton data content");

	const routerData = await router.getData();
	const { isLocked, poolCode, jettonLpWalletCode } = routerData;
	// const JETTON0 = "EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv";
	// const JETTON1 = "EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi";
	const pool = await router.getPool({
		jettonAddresses: [
			contract_address,
			"EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
		],
	});

	if (!pool) {
		console.log(`Pool for ${contract_address}/TON} not found`);
		throw Error(`Pool for ${contract_address}/TON} not found`);
	}
	try {
		console.log(`fetching 
			${geckoApiBase}/networks/ton/pools/${pool.address}
             `);
		const data = await fetch(
			`${geckoApiBase}/network/ton/pools/${pool.address}`
		);
		const response = await data.json();
		console.log(response, "is the response");
	} catch (e) {
		console.log("Fetch Error", e);
	}
	console.log(contract_address.toString(), "is the contract address");
	return jettonData;
}
export default async function StonFi() {
	const OWNER_ADDRESS = "";

	const JETTON0 = "EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv";
	const JETTON1 = "EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi";

	const provider = new TonWeb.HttpProvider(
		"https://toncenter.com/api/v2/jsonRPC",
		{
			apiKey: process.env.TONCENTER_TOKEN,
		}
	);

	const router = new Router(provider, {
		revision: ROUTER_REVISION.V1,
		address: ROUTER_REVISION_ADDRESS.V1,
	});

	const routerData = await router.getData();

	const {
		isLocked,
		adminAddress,
		tempUpgrade,
		poolCode,
		jettonLpWalletCode,
		lpAccountCode,
	} = routerData;
	console.log("Router Data:", routerData);

	const pool = await router.getPool({ jettonAddresses: [JETTON0, JETTON1] });

	if (!pool) {
		throw Error(`Pool for ${JETTON0}/${JETTON1} not found`);
	}

	const poolAddress = await pool.getAddress();
	console.log("POOL ADDRESS:", poolAddress.toString(true, true, false));
	const poolData = await pool.getData();
	const {
		reserve0,
		reserve1,
		token0WalletAddress,
		token1WalletAddress,
		lpFee,
		protocolFee,
		refFee,
		protocolFeeAddress,
		collectedToken0ProtocolFee,
		collectedToken1ProtocolFee,
	} = poolData;
	console.log("Pool Data:", poolData);
	const expectedLiquidityData = await pool.getExpectedLiquidity({
		jettonAmount: new TonWeb.utils.BN(500000000),
	});

	const { amount0, amount1 } = expectedLiquidityData;

	const expectedLpTokensAmount = await pool.getExpectedTokens({
		amount0: new TonWeb.utils.BN(500000000),
		amount1: new TonWeb.utils.BN(200000000),
	});

	if (token0WalletAddress) {
		const expectedOutputsData = await pool.getExpectedOutputs({
			amount: new TonWeb.utils.BN(500000000),
			jettonWallet: token0WalletAddress,
		});

		const { jettonToReceive, protocolFeePaid, refFeePaid } =
			expectedOutputsData;
	}

	const lpAccountAddress = await pool.getLpAccountAddress({
		ownerAddress: OWNER_ADDRESS,
	});

	const lpAccount = await pool.getLpAccount({ ownerAddress: OWNER_ADDRESS });

	if (lpAccount) {
		const lpAccountData = await lpAccount.getData();
		const { userAddress, poolAddress, amount0, amount1 } = lpAccountData;

		console.log(lpAccountData);
	}
}
