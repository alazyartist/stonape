import { bot } from "./bot.js";
import express, { Request, Response } from "express";
import { getChatId } from "./redis.js";
import { getPumpTokenInfo } from "./helius.js";
import { calculateMarketCap, convertToK } from "./utils.js";
const app = express();
const port = 80;
// Middleware to parse incoming requests with JSON payloads
app.use(express.json());
bot.start();
// const chatid = "-4188325364";
// Route for handling POST requests
app.get("/", (req: Request, res: Response) => {
	res.status(200).send("Ston_Ape_Bot Is Active");
});
app.post("/", (req: Request, res: Response) => {
	// console.log("Received webhook:", req);
	console.log("Received webhook:", req.body.events);
	if (Array.isArray(req.body)) {
		req.body.forEach(async (message) => {
			const mint_addr = message.tokenTransfers[0].mint;
			const token_amt = message.tokenTransfers[0].tokenAmount;
			const sol_spent = Math.abs(
				parseInt(message.accountData?.[0].nativeBalanceChange) / 1_000_000_000
			);
			const chatid = await getChatId(mint_addr);
			const userWallet = message.accountData[0].account;
			const info = await getPumpTokenInfo(mint_addr);
			const marketCap = await calculateMarketCap(sol_spent, token_amt);
			if (!chatid) {
				console.log("No chat id found for", mint_addr);
				return;
			}

			bot.api.sendPhoto(chatid, info.image, {
				caption: `🚨New <b> ${info.name}</b> Buy 🚨
				<blockquote>${info.description}</blockquote>
				💸|SPENT <b>${sol_spent}</b>
				🤑|Received: <b>${convertToK(token_amt)}</b>
				🔒|User Wallet <a href='https://solscan.io/account/${userWallet}'>Check User Wallet</a>
				🎓| Market Cap ${marketCap}
				
				    🚀 a winning choice 🚀        

				<a href='https://pump.fun/${mint_addr}'>BUY</a>
				
				`,
				parse_mode: "HTML",
			});
		});
	}

	// ⬜⬜⬜⬜⬜⬜
	// ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
	// 🟩⬛⬛⬛⬛⬛⬛⬛⬛⬛
	// 🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛
	// 🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛
	// 🟩🟩🟩🟩⬛⬛⬛⬛⬛⬛
	// 🟩🟩🟩🟩🟩⬛⬛⬛⬛⬛

	// ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
	// 🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜
	// 🟩🟩⬜⬜⬜⬜⬜⬜⬜⬜
	// 🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜
	// 🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜
	// 🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜
	// 🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜
	// 🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜
	// 🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜
	// 🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜
	// 🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜

	//custom emojis deluge.cash // need Fragment. telgram username to send custom emoji
	// "6210755694811942323" - empty left
	// "6210484325893278921" - empty middle
	// "6213111986884972262" - empty right
	// "6213097422650870923" - filled left
	// "6210847100305935879" - filled middle
	// "6210691566655245929" - filled right

	// bot.api.sendMessage(
	// 	chatid,
	// 	`Pump Fun Buy:
	// 		${req.body.description}`
	// );
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
