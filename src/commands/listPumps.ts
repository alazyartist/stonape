import { InlineKeyboard } from "grammy";
import { MyContext } from "../bot";
import { convertToK } from "../utils";
import { getActivePumps } from "../redis";
import { getPumpTokenInfo } from "../helius";

export async function listPumps(ctx: MyContext) {
	const active_pumps = await getActivePumps();
	if (!active_pumps) {
		ctx.reply("No Active Pumps found");
		return;
	}
	const keyboard = new InlineKeyboard();

	const message = active_pumps
		.map(async (ca, index) => {
			const info = await getPumpTokenInfo(ca);
			keyboard.text(info.name, `${ca}`).row();
			return `${index + 1}. ${info.name} - ${info.symbol} - ${
				info.description
			}`;
		})
		.join("\n");
	if (!message) {
		ctx.reply("No Active Pumps found");
		return;
	}
	ctx.reply(message, {
		reply_markup: keyboard,
	});
}
