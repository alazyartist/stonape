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
const bot_js_1 = require("./bot.js");
const express_1 = __importDefault(require("express"));
const redis_js_1 = require("./redis.js");
const helius_js_1 = require("./helius.js");
const utils_js_1 = require("./utils.js");
const app = express_1.default();
const port = 80;
// Middleware to parse incoming requests with JSON payloads
app.use(express_1.default.json());
bot_js_1.bot.start();
// const chatid = "-4188325364";
// Route for handling POST requests
app.post("/", (req, res) => {
    console.log("Received webhook:", req.body);
    if (Array.isArray(req.body)) {
        req.body.forEach((message) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const mint_addr = message.tokenTransfers[0].mint;
            const token_amt = message.tokenTransfers[0].tokenAmount;
            const sol_spent = Math.abs(parseInt((_a = message.accountData) === null || _a === void 0 ? void 0 : _a[0].nativeBalanceChange) / 1000000000);
            const chatid = yield redis_js_1.getChatId(mint_addr);
            const userWallet = message.accountData[0].account;
            const info = yield helius_js_1.getPumpTokenInfo(mint_addr);
            const marketCap = yield utils_js_1.calculateMarketCap(sol_spent, token_amt);
            if (!chatid) {
                console.log("No chat id found for", mint_addr);
                return;
            }
            bot_js_1.bot.api.sendPhoto(chatid, info.image, {
                caption: `
				🚨New <b> ${info.name}</b> Buy 🚨
				<blockquote>${info.description}</blockquote>
				💸|SPENT <b>${sol_spent}</b>
				🤑|Received: <b>${utils_js_1.convertToK(token_amt)}</b>
				🔒|User Wallet <a href='https://solscan.io/account/${userWallet}'>Check User Wallet</a>
				🎓| Market Cap ${marketCap}
				
				    🚀 a winning choice 🚀        

				<a href='https://pump.fun/${mint_addr}'>BUY</a>
				
				`,
                parse_mode: "HTML",
            });
        }));
    }
    // bot.api.sendMessage(
    // 	chatid,
    // 	`Pump Fun Buy:
    // 		${req.body.description}`
    // );
    res.status(200).send("Webhook received");
});
// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
