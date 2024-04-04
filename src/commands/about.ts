import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "../bot";
import { getTokenDetails } from "../geckoTerminal";
import { convertToK } from "../utils";
import { Address, toNano } from "@ton/core";
export default async function aboutToken(
	conversation: MyConversation,
	ctx: MyContext
) {
	let caAddr;
	const initialMatch = ctx.match as string;
	if (initialMatch) {
		caAddr = initialMatch;
	} else {
		await ctx.reply("Please provide a contract address");
		const { message } = await conversation.wait();
		caAddr = message?.text as string;
	}
	if (caAddr && !Address.isAddress(caAddr)) {
		ctx.reply(`You didn't provide a contract address, please try again.
        /about <contract_address>
        `);
		return;
	}
	const stonfidata = await getTokenDetails(caAddr, "ton");
	if (stonfidata !== undefined) {
		const messageInfo = `
	<b>🚀 ${stonfidata.name} 🚀</b>
	<pre>
	📝 Description | ${stonfidata.description}
	───────────────┼────────────────────────
	🏊 Pool Name   | ${stonfidata.poolName}
	🏛️ Pool Dex    | ${stonfidata.poolDex}
	🌟 Symbol      | ${stonfidata.symbol}
	💵 Price       | ${stonfidata.price}
	📈 24h Volume  | ${convertToK(stonfidata.volume)}
	🌀 Pool        | ${stonfidata.pool}
	</pre>

	
	<b>CA: (👆 to copy)</b>
	<code>${caAddr}</code>
	`;
		const linkMessage = `
${
	stonfidata.twitter
		? `Twitter: <a href='https://twitter.com/${stonfidata.twitter}'>@${stonfidata.twitter}</a>\n`
		: ""
}
${
	stonfidata.website
		? `Website: <a href='${stonfidata.website}'>Visit Website</a>\n`
		: ""
}
${
	stonfidata.pool
		? `GeckoTerm: <a href='https://geckoterminal.com/ton/pools/${stonfidata.pool}'>See Chart</a>\n`
		: ""
}
${
	stonfidata.telegram
		? `Telegram: <a href='https://t.me/${stonfidata.telegram}'>${stonfidata.telegram}</a>\n`
		: ""
}`;
		const linkKeyboard = new InlineKeyboard()
			.url("📈", `https://geckoterminal.com/ton/pools/${stonfidata.pool}`)
			.url("✈️", `https://t.me/${stonfidata.telegram}`)
			.url("🐦", `https://twitter.com/${stonfidata.twitter}`)
			.row();

		const inlineKeyboard = new InlineKeyboard()
			.url(
				"Stonfi Swap",
				`https://app.ston.fi/swap?&ft=TON&tt=${caAddr}&fa=5&chartVisible=false`
			)

			.row()
			.text("links", "links");

		await ctx.reply(messageInfo, {
			reply_markup: inlineKeyboard,
			parse_mode: "HTML",
		});

		await conversation.waitForCallbackQuery("links").then(async (ctx) => {
			ctx.reply(linkMessage, {
				reply_markup: linkKeyboard,
				parse_mode: "HTML",
			});
		});
	}
}
