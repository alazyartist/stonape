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
exports.getChatAdministrators = exports.generateBondingCurveProgress = exports.calculateBondingCurve = exports.isSolanaAddress = exports.calculateMarketCap = exports.convertToK = void 0;
const web3_js_1 = require("@solana/web3.js");
const redis_1 = require("./redis");
const bot_1 = require("./bot");
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
function getSolPriceGecko() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const PRICE_OF_SOL = yield redis_1.getSolanaPrice();
        if (PRICE_OF_SOL !== "null" && PRICE_OF_SOL !== null) {
            return parseFloat(PRICE_OF_SOL);
        }
        if (!PRICE_OF_SOL || PRICE_OF_SOL === "null") {
            const data = yield fetch("https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price/So11111111111111111111111111111111111111112");
            const json = yield data.json();
            const solPrice = (_b = (_a = json === null || json === void 0 ? void 0 : json.data) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.token_prices.So11111111111111111111111111111111111111112;
            yield redis_1.storeSolanaPrice(solPrice);
            return solPrice;
        }
    });
}
function calculateMarketCap(solTraded, tokensReceived) {
    return __awaiter(this, void 0, void 0, function* () {
        const solPrice = yield getSolPriceGecko();
        const TOTAL_TOKENS = 1000000000;
        const perToken = solTraded / tokensReceived;
        const marketCapSol = perToken * TOTAL_TOKENS;
        if (!solPrice)
            return "Math is Hard Sometimes 🤷‍♂️";
        const marketCap = marketCapSol * solPrice;
        return `${(marketCap / 1000).toFixed(2)}k`;
    });
}
exports.calculateMarketCap = calculateMarketCap;
function calculateBondingCurve(address, owner_addr, program_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!isSolanaAddress(address) ||
                !isSolanaAddress(owner_addr) ||
                !isSolanaAddress(program_id)) {
                return {
                    bonding_percent: "math is hard",
                    progress_bar: "🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜",
                };
            }
            const token_addr = new web3_js_1.PublicKey(address);
            const owner = new web3_js_1.PublicKey(owner_addr);
            const PROGRAM_ID = new web3_js_1.PublicKey(program_id);
            const token_address_key = token_addr.toBase58();
            const token_addr_cache = redis_1.client.hget(token_address_key, "token_account", (err, data) => {
                if (err)
                    console.error(err);
                else {
                    console.log("TOKEN_INFO from redis", token_address_key, data);
                    return data;
                }
            });
            const connection = new web3_js_1.Connection(web3_js_1.clusterApiUrl("mainnet-beta"));
            let token_account = yield connection.getParsedTokenAccountsByOwner(owner, {
                mint: token_addr,
            });
            const token_account_addr = token_account.value[0].pubkey;
            yield redis_1.client.hset(token_address_key, "token_account", token_account_addr.toBase58());
            console.log("tokenaccount", token_account.value[0].pubkey);
            const token_supply = yield connection.getTokenAccountBalance(token_account_addr);
            console.log("token_supply", token_supply);
            const total_supply = token_supply.value.uiAmount;
            console.log(total_supply);
            const bonding_percent = (1 - (total_supply - 204000000) / 800000000) * 100;
            console.log(bonding_percent);
            return {
                bonding_percent: bonding_percent.toFixed(2),
                progress_bar: generateBondingCurveProgress(bonding_percent),
            };
        }
        catch (err) {
            console.log(err);
        }
        //TODO:
        //1- (remainging tokens -204_000_000)/800_000_000
    });
}
exports.calculateBondingCurve = calculateBondingCurve;
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
function generateBondingCurveProgress(percent) {
    percent = Math.round(percent);
    if (percent < 10) {
        return "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜";
    }
    else if (percent < 20) {
        return "🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜";
    }
    else if (percent < 30) {
        return "🟩🟩⬜⬜⬜⬜⬜⬜⬜⬜";
    }
    else if (percent < 40) {
        return "🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜";
    }
    else if (percent < 50) {
        return "🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜";
    }
    else if (percent < 60) {
        return "🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜";
    }
    else if (percent < 70) {
        return "🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜";
    }
    else if (percent < 80) {
        return "🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜";
    }
    else if (percent < 90) {
        return "🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜";
    }
    else if (percent < 100) {
        return "🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜";
    }
    else if (percent >= 100) {
        return "🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩";
    }
    else {
        return "Hmmm...";
    }
}
exports.generateBondingCurveProgress = generateBondingCurveProgress;
function getChatAdministrators(chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const admins = yield bot_1.bot.api.getChatAdministrators(chatId);
            return admins;
        }
        catch (error) {
            if (error.error_code === 400 &&
                error.parameters &&
                error.parameters.migrate_to_chat_id) {
                // Group was upgraded to supergroup, use the new chat ID
                const newChatId = error.parameters.migrate_to_chat_id;
                // Update the stored chat ID in your system here
                // ...
                return yield bot_1.bot.api.getChatAdministrators(newChatId);
            }
            else {
                // Handle other errors or rethrow them
                throw error;
            }
        }
    });
}
exports.getChatAdministrators = getChatAdministrators;
