"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
const web3_js_1 = require("@solana/web3.js");
const redis_1 = require("./redis");
dotenv.config();
function checkWallet(ctx, wallet_to_check) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const user_chat_id = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
        ctx.reply("Checking wallet, please wait...");
        try {
            const data = yield fetch(`https://api.helius.xyz/v0/addresses/WATcHGu7tvKrwp8SzNyp4Z2mB4sSEC8w6AyAwfh28A5/transactions?api-key=${process.env.HELIUS_KEY}&type=TRANSFER`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const transactions = yield data.json();
            const whitelistSet = new Set();
            yield transactions.forEach((transaction) => __awaiter(this, void 0, void 0, function* () {
                if (transaction.type === "TRANSFER" &&
                    transaction.nativeTransfers.some((t) => t.toUserAccount === "WATcHGu7tvKrwp8SzNyp4Z2mB4sSEC8w6AyAwfh28A5") &&
                    transaction.nativeTransfers[0].amount >= web3_js_1.LAMPORTS_PER_SOL * 0.1) {
                    const fromUserAccount = transaction.nativeTransfers[0].fromUserAccount;
                    yield redis_1.client.sadd("whitelist", fromUserAccount);
                    if (whitelistSet.has(fromUserAccount)) {
                        console.log(`${fromUserAccount} is in the new whitelist.`);
                        redis_1.client.sadd("whitelist", fromUserAccount);
                        redis_1.client.sadd("whitelist:chat_id", user_chat_id.toString());
                        yield ctx.reply(`Wallet ${fromUserAccount} has been whitelisted`);
                    }
                    else {
                        console.log(transaction.description);
                        yield redis_1.client.sadd("whitelist", fromUserAccount);
                        yield redis_1.client.sadd("whitelist:chat_id", user_chat_id.toString());
                        whitelistSet.add(fromUserAccount);
                        console.log(`${fromUserAccount} added to the whitelist.`);
                        // 					await ctx.reply(`
                        // Wallet ${fromUserAccount} added to the whitelist.
                        // You can now access the bot
                        // Thank you for your support.`);
                    }
                }
            }));
            const wl_recheck = yield redis_1.client.smembers("whitelist");
            console.log("check wallet", wl_recheck, wl_recheck.includes(wallet_to_check));
            return wl_recheck.includes(wallet_to_check);
        }
        catch (err) {
            console.error(err);
            ctx.reply("An error occured while checking the wallet, please notify @alazyartist");
        }
        const wl = yield redis_1.client.smembers("whitelist");
        if (wl.includes(wallet_to_check)) {
            redis_1.client.sadd("whitelist:chat_id", user_chat_id.toString());
            console.log("Wallet is whitelisted in redis");
            ctx.reply(`
Wallet ${wallet_to_check} added to the whitelist.
You can now access the bot
Thank you for your support.`);
        }
    });
}
exports.default = checkWallet;
