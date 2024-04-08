import * as dotenv from "dotenv";
import {
	type Conversation,
	type ConversationFlavor,
	conversations,
	createConversation,
} from "@grammyjs/conversations";
import { Bot, Context, session } from "grammy";
import { Menu } from "@grammyjs/menu";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";

import { caSetup } from "./conversations/casetup";
import aboutToken from "./commands/about";
import { topPools } from "./commands/topPools";
import setupPump from "./conversations/setupPump";
import { listPumps } from "./commands/listPumps";
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

bot.api.setMyCommands([
	{ command: "start", description: "Start the Bot" },
	{ command: "list_pumps", description: "Get a List of Active Pumps" },
	{ command: "about", description: "Get information about a token" },
	// { command: "ape", description: "Make Aping Easy AF" },
	{ command: "top", description: "Get Top Pools on TON" },
	{ command: "ca", description: "Setup a contract address" },
	{ command: "setup_pump", description: "Setup a PumpFun BuyBot" },
]);
const menu = new Menu<MyContext>("main-menu").text("watch.it.pump", (ctx) =>
	ctx.conversation.enter("setupPump")
);
bot.use(menu);
bot.command("start", (ctx) =>
	ctx.reply(
		`Welcome ${ctx.from?.username}, You have successfully started the ston_ape_bot!`,
		{
			reply_markup: menu,
		}
	)
);
bot.command("ca", async (ctx) => {
	await ctx.conversation.enter("caSetup");
});
bot.command("test", async (ctx) => {
	const connection = new Connection(clusterApiUrl("mainnet-beta"));
	const token = new PublicKey("DtFjJtZs1N1Mi1SR5aUyfigAT1ssLEUHeruZPF3QNy6F");
	const token_supply = await connection.getTokenSupply(token);
	const whales = await connection.getTokenLargestAccounts(token);
	const total_supply = token_supply.value.uiAmount;
	console.log(total_supply);
	console.log(whales);
	ctx.reply("test ran");
	ctx.reply("total_supply is " + total_supply);
});
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
bot.callbackQuery("about", async (ctx) => {
	console.log(ctx.match);
});
bot.callbackQuery("ca_setup", async (ctx) => {
	await ctx.conversation.enter("caSetup");
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
	console.log(ctx.message);
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
