import { Bot, Context, InlineKeyboard, session } from "grammy";
import { MyContext, MyConversation } from "../bot";
import { convertToK } from "../utils";
import { getTokenDetails } from "../geckoTerminal";

const ynkeyboard = new InlineKeyboard().text("Yes", "yes").text("No", "no");

export async function caSetup(conversation: MyConversation, ctx: MyContext) {
	await ctx.reply("Hello, I am ready for the ca");
	const { message } = await conversation.wait();
	const contract_address = message?.text as string;
	try {
		const stonfidata = await getTokenDetails(contract_address, "ton");
		console.log(stonfidata, "is the stonfidata");
		if (stonfidata !== undefined) {
			const messageInfo = `
			${stonfidata.name}
			${stonfidata.description}
			Pool Name: ${stonfidata.poolName}
			Pool Dex: ${stonfidata.poolDex}
			Symbol: ${stonfidata.symbol}
			Price: ${stonfidata.price}
			24h Volume: ${convertToK(stonfidata.volume)}
			Pool: ${stonfidata.pool}
			Twitter: ${stonfidata.twitter}
			Telegram: ${stonfidata.telegram}
			Website: ${stonfidata.website}
			
			CA:
			${contract_address}
			`;
			ctx.reply(messageInfo);
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
