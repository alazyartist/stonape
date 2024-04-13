import { bot } from "./bot.js";
import express, { Request, Response } from "express";
import { getChatId } from "./redis.js";
import { getPumpTokenInfo } from "./helius.js";
import * as dotenv from "dotenv";
dotenv.config();
import { run } from "@grammyjs/runner";
import {
	calculateMarketCap,
	convertToK,
	calculateBondingCurve,
} from "./utils.js";
const app = express();
const port = process.env.MODE === "DEV" ? 80 : 5000;
// Middleware to parse incoming requests with JSON payloads
app.use(express.json());
// bot.start();
const runner = run(bot);
if (runner.isRunning()) {
	console.log("Runner Bot is running:", runner.isRunning());
}

// const chatid = "-4188325364";
// Route for handling POST requests
app.get("/", (req: Request, res: Response) => {
	res.status(200).send("Ston_Ape_Bot Is Active");
});
app.post("/", (req: Request, res: Response) => {
	// console.log("Received webhook:", req);

	if (Array.isArray(req.body)) {
		req.body.forEach(async (message) => {
			console.log("received message", message.type);
			console.log("received message", message.description);
			// console.log("Message:", message);
			// if (message.type !== "TRANSFER") return;
			const from_addr = message.tokenTransfers[0]?.fromUserAccount;
			if (!from_addr) return;
			const fee_payer = message.feePayer;
			const IS_BUY = from_addr !== fee_payer;
			if (
				message.mint_addr === "So11111111111111111111111111111111111111112" ||
				message.tokenTransfers[0].mint ===
					"So11111111111111111111111111111111111111112"
			) {
				return;
			}
			// if (from_addr === fee_payer) return;
			const mint_addr = message.tokenTransfers[0].mint;
			const token_amt = message.tokenTransfers[0].tokenAmount;
			const chatid = await getChatId(mint_addr);
			if (!chatid) {
				console.log("No chat id found for", mint_addr);
				return;
			}
			const sol_spent = Math.abs(
				parseInt(message.accountData?.[0].nativeBalanceChange) / 1_000_000_000
			);

			const userWallet = message.accountData[0].account;
			const info = await getPumpTokenInfo(mint_addr);
			const marketCap = await calculateMarketCap(sol_spent, token_amt);
			if (chatid && IS_BUY && info.program_id) {
				const program_id = info?.program_id;
				console.log("bcinfo", mint_addr, from_addr, program_id);
				const bonding_curve = await calculateBondingCurve(
					mint_addr,
					from_addr,
					program_id
				);
				if (IS_BUY) {
					let bc_percent = "idk maybe";
					let bc_display = "🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜";
					if (bonding_curve !== undefined) {
						bc_percent = bonding_curve?.bonding_percent;
						bc_display = bonding_curve?.progress_bar;
					}

					if (sol_spent > 3.0) {
						console.log("whale alert");
						bot.api.sendPhoto(
							chatid,
							"https://unsplash.com/photos/whales-tail-sticking-out-of-the-ocean-during-day-ZC2PWF4jTHc",
							{
								caption: `
					🚨New <b>${info.name}</b> Buy 🚨
						THROUGH pump.fun
<b>🐳 WHALE ALERT 🐳</b>

			<blockquote>${info.description.slice(0, 60)}...</blockquote>
			💸|SPENT <b>${sol_spent}</b>
			💰|BAG: <b>${convertToK(token_amt)}</b>
			🔒|<a href='https://solscan.io/account/${userWallet}'>Check User Wallet</a>
			📊| Market Cap ${marketCap}
					
				    		🚀 a winning choice 🚀        
							Bonding Curve Filled ${bc_percent}%
							${bc_display}
				<a href='https://pump.fun/${mint_addr}'>BUY on pump.fun</a>

				<code>${mint_addr}</code>
					
					`,
								parse_mode: "HTML",
							}
						);
					} else {
						console.log("buy pump alert");
						bot.api.sendPhoto(chatid, info.image, {
							caption: `
						🚨New <b>${info.name}</b> Buy 🚨
						THROUGH pump.fun
			<blockquote>${info.description.slice(0, 60)}...</blockquote>
			💸|SPENT <b>${sol_spent}</b>
			💰|BAG: <b>${convertToK(token_amt)}</b>
			🔒|<a href='https://solscan.io/account/${userWallet}'>Check User Wallet</a>
			📊| Market Cap ${marketCap} ${Array(Math.floor(sol_spent * 10))
								.fill(`🤑`)
								.join("")}
					
				    		🚀 a winning choice 🚀        
							Bonding Curve Filled ${bc_percent}%
							${bc_display}
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
				bot.api.sendPhoto(chatid, "https://i.imgflip.com/2uyw92.png", {
					caption: `
					🚨JEET ALERT🚨
			💸|JEETED FOR <b>${sol_spent}</b>
			💰|LOST BAG of ${info.name}: <b>${convertToK(token_amt)}</b>
			🔒|<a href='https://solscan.io/account/${userWallet}'>Check User Wallet</a>
			| Market Cap GO DOWN ${Array(Math.floor(sol_spent * 10))
				.fill(`😓`)
				.join("")}
				
				    what a dunce! 🤡 
		
			<a href='https://pump.fun/${mint_addr}'>ITS ON SALE</a>
			
			`,
					parse_mode: "HTML",
				});
			}

			if (message.type === "SWAP" && chatid) {
				console.log("swap alert");
				bot.api.sendPhoto(chatid, info.image, {
					caption: `🚨New <b>${info.name}</b> Buy 🚨 
						SWAP on Raydium
			<blockquote>${info.description}</blockquote>
			💸|SPENT <b>${sol_spent}</b>
			🤑|Received: <b>${convertToK(token_amt)}</b>
			🔒|User Wallet <a href='https://solscan.io/account/${userWallet}'>Check User Wallet</a>
			📊| Market Cap ${marketCap}
					
				    	🚀 a winning choice 🚀        
						<code>${mint_addr}</code>
						
			<a href='https://pump.fun/${mint_addr}'>BUY</a> | <a href='https://dexscreener.com/solana/${mint_addr}'>DEX</a>
						
					`,
					parse_mode: "HTML",
				});
			}
		});
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
	} else {
		console.log(`Server listening at http://localhost:${port}`);
	}
});
