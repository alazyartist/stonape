import * as dotenv from "dotenv";
import {
	type Conversation,
	type ConversationFlavor,
	conversations,
	createConversation,
} from "@grammyjs/conversations";
import { Bot, Context, session } from "grammy";
import { Menu } from "@grammyjs/menu";
import { PublicKey } from "@solana/web3.js";

import { calculateBondingCurve } from "./utils";
import { caSetup } from "./conversations/casetup";
import aboutToken from "./commands/about";
import { topPools } from "./commands/topPools";
import setupPump from "./conversations/setupPump";
import { listPumps } from "./commands/listPumps";
import removePump from "./conversations/removePump";

dotenv.config();

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;
const BOT_TOKEN =
	process.env.MODE === "DEV"
		? process.env.TELEGRAM_DEV_TOKEN
		: process.env.TELEGRAM_TOKEN;
export const bot = new Bot<MyContext>(BOT_TOKEN as string);
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
// bot.api.getMe().then(console.log).catch(console.error);
bot.catch((err) => {
	err.ctx.reply("An error occurred, please try again");
	console.error(`Error for ${err.ctx.update.message}`, err);
	bot.start();
});
bot.use(createConversation(caSetup));
bot.use(createConversation(aboutToken));
bot.use(createConversation(setupPump));
bot.use(createConversation(removePump));

bot.api.setMyCommands([
	{ command: "start", description: "Start the Bot" },
	{ command: "list_pumps", description: "Get a List of Active Pumps" },
	{ command: "about", description: "Get information about a token" },
	// { command: "ape", description: "Make Aping Easy AF" },
	{ command: "top", description: "Get Top Pools on TON" },
	{ command: "ca", description: "Setup a contract address" },
	{ command: "setup_pump", description: "Setup a PumpFun BuyBot" },
	{ command: "remove_pump", description: "Remove a PumpFun BuyBot" },
]);
const menu = new Menu<MyContext>("main-menu").text("watch.it.pump", (ctx) =>
	ctx.conversation.enter("setupPump")
);
bot.use(menu);

bot.command("start", (ctx) =>
	ctx.reply(
		`Welcome ${ctx.from?.username}, You have successfully started watch.it.pump!`,
		{
			reply_markup: menu,
		}
	)
);
bot.command("ca", async (ctx) => {
	await ctx.conversation.enter("caSetup");
});

// bot.command("test", async (ctx) => {
// 	// 	try {
// 	// 		const connection = new Connection(clusterApiUrl("mainnet-beta"));
// 	// 		// "DtFjJtZs1N1Mi1SR5aUyfigAT1ssLEUHeruZPF3QNy6F"
// 	const token_addr = new PublicKey(
// 		"4k6HZsdxbbyU3HnJzV9UB1DBEWWvsQewEMsQaW6mx1df"
// 	);
// 	const bonding_curve_addr = new PublicKey(
// 		"Ch6wJvWbNzZ2EAyPr63Wy4LxHzLroTa4JaDQx3YYJaVt"
// 	);
// 	const PROGRAM_ID = new PublicKey(
// 		"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
// 	);
// 	const bc = await calculateBondingCurve(
// 		token_addr,
// 		bonding_curve_addr,
// 		PROGRAM_ID
// 	);
// 	if (bc.progress_bar) ctx.reply(bc.progress_bar);
// 		// const token_mint = await getMint(connection, token_addr);
// 		// console.log("token_mint", token_mint);
// 		// const token_account = await connection.getTokenAccountBalance(token_addr);
// 		// console.log("tokenaccount", token_account);
// 		let token_account = await connection.getParsedTokenAccountsByOwner(
// 			bonding_curve_addr,
// 			{
// 				mint: token_addr,
// 			}
// 		);
// 		const token_account_addr = token_account.value[0].pubkey;
// 		console.log("tokenaccount", token_account.value[0].pubkey);
// 		const token_supply = await connection.getTokenAccountBalance(
// 			token_account_addr
// 		);
// 		console.log("token_supply", token_supply);

// 		const total_supply = token_supply.value.uiAmount;
// 		console.log(total_supply);
// 		ctx.reply("test ran");
// 		ctx.reply("total_supply is " + total_supply);
// 	} catch (err) {
// 		console.log(err);
// 		ctx.reply("An error occurred");
// 	}
// });
bot.command("top", async (ctx) => {
	await topPools(ctx);
});
bot.command("about", async (ctx) => {
	await ctx.conversation.enter("aboutToken");
});
bot.command("list_pumps", async (ctx) => {
	await listPumps(ctx);
});
bot.command("chatid", async (ctx) => {
	console.log(ctx.chat?.id);
});
bot.command("setup_pump", async (ctx) => {
	await ctx.conversation.enter("setupPump");
});
bot.command("remove_pump", async (ctx) => {
	await ctx.conversation.enter("removePump");
});
bot.callbackQuery("about", async (ctx) => {
	console.log(ctx.match);
});
bot.callbackQuery("ca_setup", async (ctx) => {
	await ctx.conversation.enter("caSetup");
});
bot.callbackQuery("setup_pump", async (ctx) => {
	await ctx.conversation.enter("setupPump");
});
bot.on(":text").hears("ape", (ctx) => {
	ctx.reply("🦍", {
		reply_markup: {
			inline_keyboard: [
				[
					{ text: "🦍", callback_data: "ape" },
					{ text: "Don't Ape", callback_data: "no" },
				],
			],
		},
	});
});

bot.on(":text", async (ctx) => {
	console.log(ctx);
	console.log(ctx.chat);
});

bot.on(":text").hears("watch.it.pump", async (ctx) => {
	await ctx.conversation.enter("setupPump");
});

bot.callbackQuery("ape", (ctx) => {
	ctx.reply("We are gonna 🦍 it");
	ctx.conversation.exit("caSetup");
});
bot.callbackQuery("no", (ctx) => {
	ctx.reply("I guess you hate money 🤷‍♂️");
	ctx.conversation.exit("*");
});
console.log("Bot is running...");
// bot.start();

// StonFi();
// console.log("Running Stonfi");

export { MyContext, MyConversation };
