import * as dotenv from "dotenv";
import StonFi, { getStonFiData } from "./stonfiapi";
import {
	type Conversation,
	type ConversationFlavor,
	conversations,
	createConversation,
} from "@grammyjs/conversations";
import { Bot, Context, InlineKeyboard, session } from "grammy";
import { getRedis, setRedis } from "./redis";
dotenv.config();
console.log(process.env?.TELEGRAM_TOKEN as string);
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN);
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
// bot.api.getMe().then(console.log).catch(console.error);

const ynkeyboard = new InlineKeyboard().text("Yes", "yes").text("No", "no");
function convertToK(value: string) {
	return `${(parseFloat(value) / 1000).toFixed(2)}K`;
}
async function caSetup(conversation: MyConversation, ctx: MyContext) {
	await ctx.reply("Hello, I am ready for the ca");
	const { message } = await conversation.wait();
	const contract_address = message?.text as string;
	try {
		const stonfidata = await getStonFiData(contract_address);
		console.log(stonfidata, "is the stonfidata");
		if (stonfidata !== undefined) {
			// const messageInfo = `
			// ${stonfidata.name}
			// ${stonfidata.description}
			// Pool Name: ${stonfidata.poolName}
			// Pool Dex: ${stonfidata.poolDex}
			// Symbol: ${stonfidata.symbol}
			// Price: ${stonfidata.price}
			// 24h Volume: ${convertToK(stonfidata.volume)}
			// Pool: ${stonfidata.pool}
			// Twitter: ${stonfidata.twitter}
			// Telegram: ${stonfidata.telegram}
			// Website: ${stonfidata.website}

			// CA:
			// ${contract_address}
			// `;
			// ctx.reply(messageInfo);
			const messageInfo = `
			🌟 *Name*: ${stonfidata.name}
			📝 *Description*: ${stonfidata.description}
			🏊 *Pool Name*: ${stonfidata.poolName}
			🔄 *Pool Dex*: ${stonfidata.poolDex}
			🔣 *Symbol*: ${stonfidata.symbol}
			💵 *Price*: ${stonfidata.price}
			📈 *24h Volume*: ${convertToK(stonfidata.volume)}
			🌀 *Pool*: ${stonfidata.pool}
			🐦 *Twitter*: [Twitter](${stonfidata.twitter})
			📲 *Telegram*: [Telegram Group](${stonfidata.telegram})
			🌐 *Website*: [Website](${stonfidata.website})
			
			📄 *CA*:
			\`${contract_address}\`
			`;

			ctx.reply(messageInfo, { parse_mode: "MarkdownV2" });
		}
		await ctx.reply(`You want to ape: ${stonfidata?.poolName}`, {
			reply_markup: ynkeyboard,
		});
	} catch (e) {
		console.log(e);
		await ctx.reply(
			"There was an error setting up the CA, would you like to try again.",
			{ reply_markup: ynkeyboard }
		);
	}
	await ctx.reply("Setting up the CA...");
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
bot.command("about", async (ctx) => {
	const item = ctx.match;
	console.log(item);
});
bot.command("start", (ctx) =>
	ctx.reply(
		`Hello ${ctx.from?.username}, You have successfully started a Telgram Bot: STON-APE!`,
		{
			reply_markup: {
				inline_keyboard: [[{ text: "CA Setup", callback_data: "ca_setup" }]],
			},
		}
	)
);
bot.command("ca", async (ctx) => {
	await ctx.conversation.enter("caSetup");
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

bot.callbackQuery("ape", (ctx) => {
	ctx.reply("We are gonna 🦍 it");
	ctx.conversation.exit("caSetup");
});
bot.callbackQuery("no", (ctx) => {
	ctx.reply("I guess you hate money 🤷‍♂️");
	ctx.conversation.exit("caSetup");
});
console.log("Bot is running...");
bot.start();

// StonFi();
// console.log("Running Stonfi");
