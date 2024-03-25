"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tonweb_1 = __importDefault(require("tonweb"));
const sdk_1 = require("@ston-fi/sdk");
function StonFi() {
    return __awaiter(this, void 0, void 0, function* () {
        const OWNER_ADDRESS = "";
        const JETTON0 = "EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv";
        const JETTON1 = "EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi";
        const provider = new tonweb_1.default.HttpProvider("https://toncenter.com/api/v2/jsonRPC", {
            apiKey: process.env.TONCENTER_TOKEN,
        });
        const router = new sdk_1.Router(provider, {
            revision: sdk_1.ROUTER_REVISION.V1,
            address: sdk_1.ROUTER_REVISION_ADDRESS.V1,
        });
        const routerData = yield router.getData();
        const { isLocked, adminAddress, tempUpgrade, poolCode, jettonLpWalletCode, lpAccountCode, } = routerData;
        console.log("Router Data:", routerData);
        const pool = yield router.getPool({ jettonAddresses: [JETTON0, JETTON1] });
        if (!pool) {
            throw Error(`Pool for ${JETTON0}/${JETTON1} not found`);
        }
        const poolAddress = yield pool.getAddress();
        console.log("POOL ADDRESS:", poolAddress.toString(true, true, false));
        const poolData = yield pool.getData();
        const { reserve0, reserve1, token0WalletAddress, token1WalletAddress, lpFee, protocolFee, refFee, protocolFeeAddress, collectedToken0ProtocolFee, collectedToken1ProtocolFee, } = poolData;
        console.log("Pool Data:", poolData);
        const expectedLiquidityData = yield pool.getExpectedLiquidity({
            jettonAmount: new tonweb_1.default.utils.BN(500000000),
        });
        const { amount0, amount1 } = expectedLiquidityData;
        const expectedLpTokensAmount = yield pool.getExpectedTokens({
            amount0: new tonweb_1.default.utils.BN(500000000),
            amount1: new tonweb_1.default.utils.BN(200000000),
        });
        if (token0WalletAddress) {
            const expectedOutputsData = yield pool.getExpectedOutputs({
                amount: new tonweb_1.default.utils.BN(500000000),
                jettonWallet: token0WalletAddress,
            });
            const { jettonToReceive, protocolFeePaid, refFeePaid } = expectedOutputsData;
        }
        const lpAccountAddress = yield pool.getLpAccountAddress({
            ownerAddress: OWNER_ADDRESS,
        });
        const lpAccount = yield pool.getLpAccount({ ownerAddress: OWNER_ADDRESS });
        if (lpAccount) {
            const lpAccountData = yield lpAccount.getData();
            const { userAddress, poolAddress, amount0, amount1 } = lpAccountData;
            console.log(lpAccountData);
        }
    });
}
exports.default = StonFi;
