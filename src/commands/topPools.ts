import { InlineKeyboard } from "grammy";
import { MyContext } from "../bot";
import { getTopPools } from "../geckoTerminal";
import { convertToK } from "../utils";

export async function topPools(ctx: MyContext) {
	const topPools = await getTopPools("ton");
	if (!topPools) {
		ctx.reply("No top pools found");
		return;
	}
	const keyboard = new InlineKeyboard();

	const message = topPools
		.map((pool, index) => {
			keyboard.text(pool.name, `about ${pool.ca}`).row();
			return `${index + 1}. ${pool.name} - ${convertToK(pool.volume)} - ${
				pool.price_change
			}%`;
		})
		.join("\n");
	ctx.reply("Select a Pool to Get More Info", {
		reply_markup: keyboard,
	});
}
