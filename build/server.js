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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_js_1 = require("./bot.js");
const express_1 = __importDefault(require("express"));
const redis_js_1 = require("./redis.js");
const helius_js_1 = require("./helius.js");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const utils_js_1 = require("./utils.js");
const app = express_1.default();
const port = process.env.MODE === "DEV" ? 80 : 5000;
// Middleware to parse incoming requests with JSON payloads
app.use(express_1.default.json());
bot_js_1.bot.start();
// const chatid = "-4188325364";
// Route for handling POST requests
app.get("/", (req, res) => {
    res.status(200).send("Ston_Ape_Bot Is Active");
});
app.post("/", (req, res) => {
    // console.log("Received webhook:", req);
    if (Array.isArray(req.body)) {
        req.body.forEach((message) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            console.log("received message", message.type);
            console.log("received message", message.description);
            // console.log("Message:", message);
            // if (message.type !== "TRANSFER") return;
            const from_addr = (_a = message.tokenTransfers[0]) === null || _a === void 0 ? void 0 : _a.fromUserAccount;
            if (!from_addr)
                return;
            const fee_payer = message.feePayer;
            const IS_BUY = from_addr !== fee_payer;
            if (message.mint_addr === "So11111111111111111111111111111111111111112") {
                return;
            }
            // if (from_addr === fee_payer) return;
            const mint_addr = message.tokenTransfers[0].mint;
            const token_amt = message.tokenTransfers[0].tokenAmount;
            const sol_spent = Math.abs(parseInt((_b = message.accountData) === null || _b === void 0 ? void 0 : _b[0].nativeBalanceChange) / 1000000000);
            const chatid = yield redis_js_1.getChatId(mint_addr);
            const userWallet = message.accountData[0].account;
            const info = yield helius_js_1.getPumpTokenInfo(mint_addr);
            const marketCap = yield utils_js_1.calculateMarketCap(sol_spent, token_amt);
            if (!chatid) {
                console.log("No chat id found for", mint_addr);
                return;
            }
            if (chatid && IS_BUY && info.program_id) {
                const program_id = info === null || info === void 0 ? void 0 : info.program_id;
                console.log("bcinfo", mint_addr, from_addr, program_id);
                const bonding_curve = yield utils_js_1.calculateBondingCurve(mint_addr, from_addr, program_id);
                if (IS_BUY) {
                    let bc_percent = "idk maybe";
                    let bc_display = "🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜";
                    if (bonding_curve !== undefined) {
                        bc_percent = bonding_curve === null || bonding_curve === void 0 ? void 0 : bonding_curve.bonding_percent.toFixed(2);
                        bc_display = bonding_curve === null || bonding_curve === void 0 ? void 0 : bonding_curve.progress_bar;
                    }
                    if (sol_spent > 3.0) {
                        console.log("whale alert");
                        bot_js_1.bot.api.sendPhoto(chatid, "https://unsplash.com/photos/whales-tail-sticking-out-of-the-ocean-during-day-ZC2PWF4jTHc", {
                            caption: `
					🚨New <b>${info.name}</b> Buy 🚨
						THROUGH pump.fun
<b>🐳 WHALE ALERT 🐳</b>

			<blockquote>${info.description.slice(0, 60)}...</blockquote>
			💸|SPENT <b>${sol_spent}</b>
			💰|BAG: <b>${utils_js_1.convertToK(token_amt)}</b>
			🔒|<a href='https://solscan.io/account/${userWallet}'>Check User Wallet</a>
			📊| Market Cap ${marketCap}
					
				    		🚀 a winning choice 🚀        
							Bonding Curve Filled ${bc_percent}%
							${bc_display}
				<a href='https://pump.fun/${mint_addr}'>BUY on pump.fun</a>

				<code>${mint_addr}</code>
					
					`,
                            parse_mode: "HTML",
                        });
                    }
                    else {
                        console.log("buy pump alert");
                        bot_js_1.bot.api.sendPhoto(chatid, info.image, {
                            caption: `
						🚨New <b>${info.name}</b> Buy 🚨
						THROUGH pump.fun
			<blockquote>${info.description.slice(0, 60)}...</blockquote>
			💸|SPENT <b>${sol_spent}</b>
			💰|BAG: <b>${utils_js_1.convertToK(token_amt)}</b>
			🔒|<a href='https://solscan.io/account/${userWallet}'>Check User Wallet</a>
			📊| Market Cap ${marketCap}
					
				    		🚀 a winning choice 🚀        
							Bonding Curve Filled ${bonding_curve.bonding_percent.toFixed(2)}%
							${bonding_curve.progress_bar}
				<a href='https://pump.fun/${mint_addr}'>BUY on pump.fun</a>

				<code>${mint_addr}</code>
					
					`,
                            parse_mode: "HTML",
                        });
                    }
                }
            }
            if (chatid && !IS_BUY && sol_spent > 1.0) {
                console.log("jeet alert");
                bot_js_1.bot.api.sendPhoto(chatid, "https://i.imgflip.com/2uyw92.png", {
                    caption: `
					🚨JEET ALERT🚨
			💸|JEETED FOR <b>${sol_spent}</b>
			💰|LOST BAG of ${info.name}: <b>${utils_js_1.convertToK(token_amt)}</b>
			🔒|<a href='https://solscan.io/account/${userWallet}'>Check User Wallet</a>
			| Market Cap GO DOWN
				
				    what a dunce! 🤡 
		
			<a href='https://pump.fun/${mint_addr}'>ITS ON SALE</a>
			
			`,
                    parse_mode: "HTML",
                });
            }
            if (message.type === "SWAP" && chatid) {
                console.log("swap alert");
                bot_js_1.bot.api.sendPhoto(chatid, info.image, {
                    caption: `🚨New <b>${info.name}</b> Buy 🚨 
						SWAP on Raydium
			<blockquote>${info.description}</blockquote>
			💸|SPENT <b>${sol_spent}</b>
			🤑|Received: <b>${utils_js_1.convertToK(token_amt)}</b>
			🔒|User Wallet <a href='https://solscan.io/account/${userWallet}'>Check User Wallet</a>
			📊| Market Cap ${marketCap}
					
				    	🚀 a winning choice 🚀        
				
			<a href='https://pump.fun/${mint_addr}'>BUY</a>
					
					`,
                    parse_mode: "HTML",
                });
            }
        }));
    }
    res.status(200).send("Webhook received");
});
// Start the server
app.listen(port, () => {
    if (process.env.MODE === "DEV") {
        console.log(`
		Server listening at http://localhost:${port} 
		IN DEV MODE
		`);
    }
    else {
        console.log(`Server listening at http://localhost:${port}`);
    }
});
