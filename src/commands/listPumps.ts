import { InlineKeyboard } from "grammy";
import { MyContext } from "../bot";
import { convertToK } from "../utils";
import { getActivePumps } from "../redis";
import { getPumpTokenInfo } from "../helius";
import { getChatId, getGroupName } from "../redis.js";
export async function listPumps(ctx: MyContext) {
	const active_pumps = await getActivePumps();
	if (!active_pumps || active_pumps.length === 0) {
		ctx.reply("No Active Pumps found");
		return;
	}

	const keyboard = new InlineKeyboard();
	const infoPromises = active_pumps.map((ca) => getPumpTokenInfo(ca));
	const chatIdPromises = active_pumps.map((ca) => getChatId(ca));
	const groupNamePromises = active_pumps.map((ca) => getGroupName(ca));

	try {
		const infos = await Promise.all(infoPromises);
		const chatIds = await Promise.all(chatIdPromises);
		const groupNames = await Promise.all(groupNamePromises);

		const message = infos
			.map((data, index) => {
				const group_name = groupNames[index];
				keyboard.url(data.name, `https://t.me/${group_name}`).row();
				return `${index + 1}. ${data.name} - ${data.symbol} - ${
					data.description
				}`;
			})
			.join("\n");

		ctx.reply(message, {
			reply_markup: keyboard,
		});
	} catch (error) {
		console.error("Error fetching pump token info:", error);
		ctx.reply("Error encountered while fetching active pumps.");
	}
}
