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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopPools = exports.getTokenDetails = void 0;
const geckoApi = "https://api.geckoTerminal.com/api/v2";
function getTokenDetails(token, network) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenData = yield fetch(`${geckoApi}/networks/${network}/tokens/${token}`);
        const tokenInfo = yield fetch(`${geckoApi}/networks/${network}/tokens/${token}/info`);
        const tokenPools = yield fetch(`${geckoApi}/networks/${network}/tokens/${token}/pools`);
        if (!tokenData || !tokenInfo || !tokenPools) {
            throw Error(`Token ${token} not found`);
        }
        const geckoData = yield tokenData.json();
        const geckoInfo = yield tokenInfo.json();
        const geckoPools = yield tokenPools.json();
        if (geckoData.data && geckoInfo.data && geckoPools.data) {
            return {
                name: geckoData.data.attributes.name,
                description: geckoInfo.data.attributes.description,
                symbol: geckoData.data.attributes.symbol,
                price: geckoData.data.attributes.price_usd,
                volume: geckoData.data.attributes.volume_usd.h24,
                pool: geckoPools.data.map((pool) => pool.attributes.address)[0],
                poolName: geckoPools.data.map((pool) => pool.attributes.name)[0],
                poolDex: geckoPools.data.map((pool) => pool.relationships.dex.data.id)[0],
                twitter: geckoInfo.data.attributes.twitter_handle,
                telegram: geckoInfo.data.attributes.telegram_handle,
                website: geckoInfo.data.attributes.websites[0],
            };
        }
    });
}
exports.getTokenDetails = getTokenDetails;
function getTopPools(network) {
    return __awaiter(this, void 0, void 0, function* () {
        const topPools = yield fetch(`${geckoApi}/networks/${network}/pools`);
        if (!topPools) {
            throw Error(`Top pools not found`);
        }
        const geckoPools = yield topPools.json();
        if (geckoPools.data) {
            const data = geckoPools.data.map((pool) => ({
                ca: pool.attributes.address,
                name: pool.attributes.name,
                volume: pool.attributes.volume_usd.h24,
                price_change: pool.attributes.price_change_percentage.h24,
            }));
            return data;
        }
    });
}
exports.getTopPools = getTopPools;
//gives token description
//gives token pools
//.data.attributes.address,
