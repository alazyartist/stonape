import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "../bot";
import { updateWebhookAddresses, getPumpTokenInfo } from "../helius";
import { storePumpData } from "../redis";
import { isSolanaAddress } from "../utils";

export default async function setupPump(
	conversation: MyConversation,
	ctx: MyContext
) {
	const telegram_user = ctx.from?.id;
	const admins = await ctx.getChatAdministrators();
	const isAdmin = admins.some((admin) => admin.user.id === telegram_user);
	if (!isAdmin) {
		return await ctx.reply("You are not an admin of this group.");
	}
	const tryAgainKeyboard = new InlineKeyboard().text("Try Again", "setup_pump");
	await ctx.reply(
		"To Setup PumpBot, you need to provide the contract address of the token. If you are adding this bot to a group.",
		{
			reply_markup: { force_reply: true },
		}
	);
	const { message } = await conversation.wait();
	const contract_address = message?.text as string;
	if (!isSolanaAddress(contract_address)) {
		await ctx.reply("Invalid contract address. Please try again.", {
			reply_markup: tryAgainKeyboard,
		});
		return;
	}

	const info = await conversation.external(() =>
		getPumpTokenInfo(contract_address)
	);
	const { image, name, description, symbol } = info;
	const keyboard = new InlineKeyboard().text("Yes", "yes").text("No", "no");
	await ctx.replyWithPhoto(image, {
		caption: `You have provided the contract address: 
        <code>${contract_address}</code>
        Token Name: ${name}
        Token Symbol: ${symbol}
        Token Description: ${description}

        <b> Is this correct?</b>`,
		reply_markup: keyboard,
		parse_mode: "HTML",
	});

	await conversation.waitForCallbackQuery(["yes", "no"]).then(async (ctx) => {
		if (ctx.callbackQuery?.data === "yes") {
			const chat_id = ctx.chat?.id as number;
			await storePumpData(contract_address, chat_id);
			const addressAdded = await conversation.external(() =>
				updateWebhookAddresses()
			);
			if (!addressAdded) {
				return await ctx.reply("Failed to add address to webhook", {
					reply_markup: tryAgainKeyboard,
				});
			}

			await ctx.reply("Setting up PumpBot...");
			await ctx.reply(
				"PumpBot has been successfully setup. You will now receive notifications for the token for 10 Hours."
			);
			await ctx.reply(
				"Please allow 2 to 3 minutes for the bot to start pulling in Buys."
			);
		} else {
			await ctx.reply("PumpBot setup cancelled.");
		}
	});
}
