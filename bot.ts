import * as dotenv from "dotenv";
import StonFi from "./stonfiapi";
import {
	type Conversation,
	type ConversationFlavor,
	conversations,
	createConversation,
} from "@grammyjs/conversations";
import { Bot, Context, InlineKeyboard, session } from "grammy";
dotenv.config();
console.log(process.env?.TELEGRAM_TOKEN as string);
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN);
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
// bot.api.getMe().then(console.log).catch(console.error);

const ynkeyboard = new InlineKeyboard().text("Yes", "yes").text("No", "no");

async function caSetup(conversation: MyConversation, ctx: MyContext) {
	await ctx.reply("Hello, I am a bot that can help you with your ape needs");
	const { message } = await conversation.wait();
	await ctx.reply(`You want to ape: ${message?.text}`, {
		reply_markup: ynkeyboard,
	});
	await conversation.waitForCallbackQuery(["yes", "no"]).then(async (ctx) => {
		if (ctx.callbackQuery?.data === "yes") {
			await ctx.reply("We are gonna 🦍 it");
			return;
		} else {
			await ctx.reply("I guess you hate money 🤷‍♂️");
			return;
		}
	});
}

bot.use(createConversation(caSetup));

bot.command("start", (ctx) =>
	ctx.reply(
		"Hello Dylan, You have successfully started a Telgram Bot: STON-APE!",
		{
			reply_markup: {
				inline_keyboard: [[{ text: "CA Setup", callback_data: "ca_setup" }]],
			},
		}
	)
);
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

bot.callbackQuery("ape", (ctx) => {
	ctx.reply("We are gonna 🦍 it");
});
bot.callbackQuery("no", (ctx) => {
	ctx.reply("I guess you hate money 🤷‍♂️");
});
// console.log("Bot is running...");
// bot.start();

StonFi();
console.log("Running Stonfi");
