import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "../bot";
import { updateWebhookAddresses, getPumpTokenInfo } from "../helius";
import { storePumpData, clearPumpData } from "../redis";
import { isSolanaAddress } from "../utils";

export default async function removePump(
	conversation: MyConversation,
	ctx: MyContext
) {
	const telegram_user = ctx.from?.id;
	const telegram_username = ctx.from?.username;
	const admins = await ctx.getChatAdministrators();
	const isAdmin = admins.some((admin) => admin.user.id === telegram_user);
	if (!isAdmin) {
		return await ctx.reply("You are not an admin of this group.");
		return;
	}
	if (isAdmin) {
		const tryAgainKeyboard = new InlineKeyboard().text(
			"Try Again",
			"setup_pump"
		);
		await ctx.reply(
			`@${telegram_username} To Remove PumpBot, you need to provide the contract address of the token. If you are adding this bot to a group.`,
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

		const info = await conversation.external(() => {
			getPumpTokenInfo(contract_address);
		});
		const { image, name, description, symbol } = info;
		const keyboard = new InlineKeyboard().text("Yes", "yes").text("No", "no");
		await ctx.replyWithPhoto(image, {
			caption: `You have provided the contract address: 
        <code>${contract_address}</code>
        Token Name: ${name}
        Token Symbol: ${symbol}
        Token Description: ${description.slice(0, 40)}...

		<b> You want to remove from ${ctx.chat}</b>
        <b> Is this correct?</b>`,
			reply_markup: keyboard,
			parse_mode: "HTML",
		});

		await conversation.waitForCallbackQuery(["yes", "no"]).then(async (ctx) => {
			if (ctx.callbackQuery?.data === "yes") {
				const chat_id = ctx.chat?.id as number;
				await clearPumpData(contract_address);
				const addressRemoved = await conversation.external(() =>
					updateWebhookAddresses()
				);
				if (!addressRemoved) {
					return await ctx.reply("Failed to remove address from webhook", {
						reply_markup: tryAgainKeyboard,
					});
				}

				await ctx.reply("Cleaning Up PumpBot...");
				await ctx.reply(
					"PumpBot has been successfully stopped. You can start it again by using /setup_pump."
				);
				await ctx.reply(
					`Please allow 2 to 3 minutes for the bot to stop pulling in Buys.
					WE HOPE YOU ENJOYED IT!
					`
				);
			} else {
				await ctx.reply("PumpBot setup cancelled.");
			}
		});
	}
}
