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
exports.isSolanaAddress = exports.calculateMarketCap = exports.convertToK = void 0;
const web3_js_1 = require("@solana/web3.js");
function convertToK(value) {
    if (parseFloat(value) < 1000)
        return value;
    if (parseFloat(value) < 1000000) {
        return `${(parseFloat(value) / 1000).toFixed(2)}K`;
    }
    if (parseFloat(value) < 1000000000) {
        return `${(parseFloat(value) / 1000000).toFixed(2)}M`;
    }
}
exports.convertToK = convertToK;
function calculateMarketCap(solTraded, tokensReceived) {
    return __awaiter(this, void 0, void 0, function* () {
        const TOTAL_TOKENS = 1000000000;
        const perToken = solTraded / tokensReceived;
        const marketCapSol = perToken * TOTAL_TOKENS;
        const data = yield fetch("https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price/So11111111111111111111111111111111111111112");
        const json = yield data.json();
        const solPrice = json.data.attributes.token_prices
            .So11111111111111111111111111111111111111112;
        const marketCap = marketCapSol * solPrice;
        return `${(marketCap / 1000).toFixed(2)}k`;
    });
}
exports.calculateMarketCap = calculateMarketCap;
function calculateBondingCurve(address) {
    return __awaiter(this, void 0, void 0, function* () {
        //TODO:
        //1- (remainging tokens -204_000_000)/800_000_000
    });
}
function isSolanaAddress(address) {
    try {
        new web3_js_1.PublicKey(address);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isSolanaAddress = isSolanaAddress;
