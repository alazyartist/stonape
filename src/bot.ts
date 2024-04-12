import * as dotenv from "dotenv";
import {
	type Conversation,
	type ConversationFlavor,
	conversations,
	createConversation,
} from "@grammyjs/conversations";
import {
	Bot,
	Context,
	Composer,
	session,
	NextFunction,
	InputFile,
} from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { Menu } from "@grammyjs/menu";
import { PublicKey } from "@solana/web3.js";

import { calculateBondingCurve } from "./utils";
import { caSetup } from "./conversations/casetup";
import aboutToken from "./commands/about";
import { topPools } from "./commands/topPools";
import setupPump from "./conversations/setupPump";
import { listPumps } from "./commands/listPumps";
import removePump from "./conversations/removePump";
import { ignoreOld, onlyPublic } from "grammy-middlewares";
import isWhitelisted from "./whitelistMiddleware";
import checkWallet from "./walletCheck";
dotenv.config();

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;
const BOT_TOKEN =
	process.env.MODE === "DEV"
		? process.env.TELEGRAM_DEV_TOKEN
		: process.env.TELEGRAM_TOKEN;
export const bot = new Bot<MyContext>(BOT_TOKEN as string);

// Use the plugin.
bot.api.config.use(
	autoRetry({
		maxRetryAttempts: 4, // only repeat requests once
		maxDelaySeconds: 1000,
	})
);
bot.use(ignoreOld(60));

bot.command("check_wallet", async (ctx) => {
	const wallet = ctx.message?.text?.split(" ")[1];
	if (!wallet) {
		ctx.reply("please enter /check_wallet [wallet_addr] to check wallet");
		return;
	}
	const wallet_check = await checkWallet(ctx, wallet);
	Promise.resolve(wallet_check).then((value) => {
		console.log("walletCheck bot value", value);
		value
			? ctx.reply("Wallet is on the whitelist")
			: ctx.reply(`Wallet is not whitelisted 
if you think this is an error, 
please try the command again, if the error persists,
please contact the dev @alazyartist`);
	});
});
bot.command("list_pumps", async (ctx) => {
	await listPumps(ctx);
});

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
// bot.api.getMe().then(console.log).catch(console.error);
bot.catch((err) => {
	err.ctx.reply(
		"An error occurred, please try again, if the error persists, contact the dev @alazyartist"
	);
	console.error(`Error for ${err.ctx.update.message}`, err);
	bot.start();
});
// bot.use(createConversation(caSetup));
bot.use(createConversation(aboutToken));
bot.use(createConversation(setupPump));
bot.use(createConversation(removePump));

bot.api.setMyCommands([
	{ command: "start", description: "Start the Bot" },
	{ command: "list_pumps", description: "Get a List of Active Pumps" },
	// { command: "about", description: "Get information about a token" },
	// { command: "ape", description: "Make Aping Easy AF" },
	// { command: "top", description: "Get Top Pools on TON" },
	// { command: "ca", description: "Setup a contract address" },
	{ command: "setup_pump", description: "Setup a PumpFun BuyBot" },
	{ command: "remove_pump", description: "Remove a PumpFun BuyBot" },
	{ command: "check_wallet", description: "Checks Whitelist" },
	// { command: "all", description: "List all commands" },
]);
const menu = new Menu<MyContext>("main-menu").text("watch.it.pump", (ctx) =>
	ctx.conversation.enter("setupPump")
);
bot.use(menu);

bot.command("start", (ctx) =>
	ctx.replyWithPhoto(new InputFile("./watchitpump.webp"), {
		caption: `Welcome ${ctx.from?.username}, You have successfully started watch.it.pump!`,
		reply_markup: menu,
	})
);
bot.command("tip_bot_dev", (ctx) =>
	ctx.replyWithPhoto(new InputFile("./watchitpump.webp"), {
		caption: `That's so thoughtful of you, 😍😍
		You can tip the dev at the following addresses:
		<code>WATcHGu7tvKrwp8SzNyp4Z2mB4sSEC8w6AyAwfh28A5</code>
		`,
		reply_markup: menu,
	})
);
// bot.command("ca", async (ctx) => {
// 	await ctx.conversation.enter("caSetup");
// });

bot.command("top", async (ctx) => {
	await topPools(ctx);
});
bot.command("about", async (ctx) => {
	await ctx.conversation.enter("aboutToken");
});
bot.command("chatid", async (ctx) => {
	console.log(ctx.chat?.id);
});
bot.callbackQuery("about", async (ctx) => {
	console.log(ctx.match);
});
bot.callbackQuery("ape", (ctx) => {
	ctx.reply("We are gonna 🦍 it");
	ctx.conversation.exit("caSetup");
});
bot.callbackQuery("no", (ctx) => {
	ctx.reply("I guess you hate money 🤷‍♂️");
	ctx.conversation.exit("*");
});
bot.command("test", async (ctx) => {
	console.log("Test Command");
	await ctx.replyWithChatAction("typing");
	setTimeout(() => {
		ctx.reply("Random Test Comlpeted after delay");
	}, 1200);
});
// bot.callbackQuery("ca_setup", async (ctx) => {
// 	await ctx.conversation.enter("caSetup");
// });
bot.use(async (ctx, next) => {
	console.log(ctx.message?.text);
	return;
});

const needsWhitelist = new Composer<MyContext>();
needsWhitelist
	.filter((ctx) =>
		ctx.hasCommand(["setup_pump", "remove_pump", "watch.it.pump"])
	)
	.use((ctx, next) => {
		console.log("This Command Needs Whitelist");
		isWhitelisted(ctx, next);
	});
needsWhitelist.callbackQuery("setup_pump", async (ctx) => {
	await ctx.conversation.enter("setupPump");
});
needsWhitelist.command("setup_pump", async (ctx) => {
	await ctx.conversation.enter("setupPump");
});
needsWhitelist.command("remove_pump", async (ctx) => {
	await ctx.conversation.enter("removePump");
});
// bot.on(":text").hears("ape", (ctx) => {
// 	ctx.reply("🦍", {
// 		reply_markup: {
// 			inline_keyboard: [
// 				[
// 					{ text: "🦍", callback_data: "ape" },
// 					{ text: "Don't Ape", callback_data: "no" },
// 				],
// 			],
// 		},
// 	});
// });

needsWhitelist.on(":text").hears("watch.it.pump", async (ctx) => {
	await ctx.conversation.enter("setupPump");
});

console.log("Bot is running...");
// bot.start();

bot.use(needsWhitelist);
// bot.on(":text", async (ctx) => {
// 	console.log(ctx);
// 	console.log(ctx.chat);
// });
export { MyContext, MyConversation };
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
