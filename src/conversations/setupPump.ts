import { MyContext, MyConversation } from "../bot";
import { storePumpData } from "../redis";

export default async function setupPump(
	conversation: MyConversation,
	ctx: MyContext
) {
	await ctx.reply(
		"To Setup PumpBot, you need to provide the contract address of the token."
	);
	const { message } = await conversation.wait();
	const contract_address = message?.text as string;
	const chat_id = ctx.chat?.id as number;
	await ctx.reply(
		`You have provided the contract address: ${contract_address} and chat id: ${chat_id}`
	);
	await ctx.reply("Setting up PumpBot...");
	await storePumpData(contract_address, chat_id);
	await ctx.reply(
		"PumpBot has been successfully setup. You will now receive notifications for the token."
	);
}
