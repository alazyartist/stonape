import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "../bot";
import { updateWebhookAddresses, getPumpTokenInfo } from "../helius";
import { storePumpData } from "../redis";
import { isSolanaAddress, getChatAdministrators } from "../utils";

export default async function setupPump(
	conversation: MyConversation,
	ctx: MyContext
) {
	if (ctx.chat?.type === "private") {
		return await ctx.reply(
			"You need to add the bot to a group to setup watch.it.pump, once added to a group, type /start@ston_ape_bot. If this is a SuperGroup or Channel, please give the bot admin rights.",
			{
				reply_markup: new InlineKeyboard().url(
					"Add Bot To Group",
					"https://t.me/ston_ape_test_bot?startgroup=true"
				),
			}
		);
	}
	const telegram_user = ctx.from?.id;
	const telegram_username = ctx.from?.username;
	const admins = await getChatAdministrators(ctx.chat?.id as number);
	const isAdmin = admins.some((admin) => admin.user.id === telegram_user);
	if (!isAdmin) {
		return await ctx.reply("You are not an admin of this group.");
	}
	if (isAdmin) {
		const tryAgainKeyboard = new InlineKeyboard().text(
			"Try Again",
			"setup_pump"
		);
		await ctx.reply(
			`@${telegram_username} To Setup PumpBot, you need to provide the contract address of the token.`,
			{
				reply_markup: { force_reply: true, selective: true },
			}
		);
		const { message } = await conversation.wait();
		const contract_address = message?.text as string;
		if (!isSolanaAddress(contract_address)) {
			return await ctx.reply("Invalid contract address. Please try again.", {
				reply_markup: tryAgainKeyboard,
			});
		}

		const info = await conversation.external(() =>
			getPumpTokenInfo(contract_address)
		);
		const { image, name, description, symbol } = info;
		const keyboard = new InlineKeyboard().text("Yes", "yes").text("No", "no");
		const description_prev = description.slice(0, 60);
		const uftDescript = Buffer.from(description_prev, "utf-8").toString(
			"utf-8"
		);
		await ctx.replyWithPhoto(image, {
			caption: `You have provided the contract address: 
        <code>${contract_address}</code>
        Token Name: ${name}
        Token Symbol: ${symbol}
        Token Description: ${utfDescript}...

        <b> Is this correct?</b>`,
			reply_markup: keyboard,
			parse_mode: "HTML",
		});

		await conversation.waitForCallbackQuery(["yes", "no"]).then(async (ctx) => {
			if (ctx.callbackQuery?.data === "yes") {
				const chat_id = ctx.chat?.id as number;

				const group_name = ctx.chat?.id.toString() as string;
				await storePumpData(contract_address, chat_id, group_name);
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
}
