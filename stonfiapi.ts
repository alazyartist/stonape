import TonWeb from "tonweb";

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from "@ston-fi/sdk";

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
