"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const geckoTerminal_1 = require("../geckoTerminal");
const utils_1 = require("../utils");
const core_1 = require("@ton/core");
function aboutToken(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        let caAddr;
        const initialMatch = ctx.match;
        if (initialMatch) {
            caAddr = initialMatch;
        }
        else {
            yield ctx.reply("Please provide a contract address");
            const { message } = yield conversation.wait();
            caAddr = message === null || message === void 0 ? void 0 : message.text;
        }
        if (caAddr && !core_1.Address.isAddress(caAddr)) {
            ctx.reply(`You didn't provide a contract address, please try again.
        /about <contract_address>
        `);
            return;
        }
        const stonfidata = yield geckoTerminal_1.getTokenDetails(caAddr, "ton");
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
	📈 24h Volume  | ${utils_1.convertToK(stonfidata.volume)}
	🌀 Pool        | ${stonfidata.pool}
	</pre>

	
	<b>CA: (👆 to copy)</b>
	<code>${caAddr}</code>
	`;
            const linkMessage = `
${stonfidata.twitter
                ? `Twitter: <a href='https://twitter.com/${stonfidata.twitter}'>@${stonfidata.twitter}</a>\n`
                : ""}
${stonfidata.website
                ? `Website: <a href='${stonfidata.website}'>Visit Website</a>\n`
                : ""}
${stonfidata.pool
                ? `GeckoTerm: <a href='https://geckoterminal.com/ton/pools/${stonfidata.pool}'>See Chart</a>\n`
                : ""}
${stonfidata.telegram
                ? `Telegram: <a href='https://t.me/${stonfidata.telegram}'>${stonfidata.telegram}</a>\n`
                : ""}`;
            const linkKeyboard = new grammy_1.InlineKeyboard()
                .url("📈", `https://geckoterminal.com/ton/pools/${stonfidata.pool}`)
                .url("✈️", `https://t.me/${stonfidata.telegram}`)
                .url("🐦", `https://twitter.com/${stonfidata.twitter}`)
                .row();
            const inlineKeyboard = new grammy_1.InlineKeyboard()
                .url("Stonfi Swap", `https://app.ston.fi/swap?&ft=TON&tt=${caAddr}&fa=5&chartVisible=false`)
                .row()
                .text("links", "links");
            yield ctx.reply(messageInfo, {
                reply_markup: inlineKeyboard,
                parse_mode: "HTML",
            });
            yield conversation.waitForCallbackQuery("links").then((ctx) => __awaiter(this, void 0, void 0, function* () {
                ctx.reply(linkMessage, {
                    reply_markup: linkKeyboard,
                    parse_mode: "HTML",
                });
            }));
        }
    });
}
exports.default = aboutToken;
