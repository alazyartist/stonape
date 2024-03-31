"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const stonfiapi_1 = require("./stonfiapi");
const conversations_1 = require("@grammyjs/conversations");
const grammy_1 = require("grammy");
const core_1 = require("@ton/core");
dotenv.config();
console.log((_a = process.env) === null || _a === void 0 ? void 0 : _a.TELEGRAM_TOKEN);
const bot = new grammy_1.Bot(process.env.TELEGRAM_TOKEN);
bot.use(grammy_1.session({ initial: () => ({}) }));
bot.use(conversations_1.conversations());
// bot.api.getMe().then(console.log).catch(console.error);
const ynkeyboard = new grammy_1.InlineKeyboard().text("Yes", "yes").text("No", "no");
function convertToK(value) {
    return `${(parseFloat(value) / 1000).toFixed(2)}K`;
}
function caSetup(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.reply("Hello, I am ready for the ca");
        const { message } = yield conversation.wait();
        const contract_address = message === null || message === void 0 ? void 0 : message.text;
        try {
            const stonfidata = yield stonfiapi_1.getStonFiData(contract_address);
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
            yield ctx.reply(`You want to ape: ${stonfidata === null || stonfidata === void 0 ? void 0 : stonfidata.poolName}`, {
                reply_markup: ynkeyboard,
            });
        }
        catch (e) {
            console.log(e);
            yield ctx.reply("There was an error setting up the CA, would you like to try again.", { reply_markup: ynkeyboard });
        }
        yield ctx.reply("Setting up the CA...");
        yield conversation.waitForCallbackQuery(["yes", "no"]).then((ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (((_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data) === "yes") {
                yield ctx.reply("We are gonna 🦍 it");
                return;
            }
            else {
                yield ctx.reply("I guess you hate money 🤷‍♂️");
                return;
            }
        }));
    });
}
bot.use(conversations_1.createConversation(caSetup));
bot.command("about", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const item = ctx.match;
    const stonfidata = yield stonfiapi_1.getStonFiData(item);
    if (stonfidata !== undefined) {
        // 	const messageInfo = `
        // 	🎯
        // 🚀${stonfidata.name}🚀
        // 📝${stonfidata.description}
        // 🏊Pool Name: ${stonfidata.poolName}
        // 🏛️Pool Dex: ${stonfidata.poolDex}
        // 🌟Symbol: ${stonfidata.symbol}
        // 💵Price: ${stonfidata.price}
        // 📈24h Volume: ${convertToK(stonfidata.volume)}
        // 🌀Pool: ${stonfidata.pool}
        // Twitter:<a href='https://twitter.com/${stonfidata.twitter}'>${
        // 		stonfidata?.twitter === null ? "Not Found" : stonfidata.twitter
        // 	}</a>
        // Telegram:<a href='https://t.me/${stonfidata.telegram}'>${
        // 		stonfidata.telegram
        // 	}</a>
        // Website: ${stonfidata.website}
        // CA:
        // ${item}
        // `;
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
	<b>Links:</b>
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
            : ""}
	
	<b>CA: (👆 to copy)</b>
	<code>${item}</code>
	`;
        const inlineKeyboard = new grammy_1.InlineKeyboard()
            .url("📈", `https://geckoterminal.com/ton/pools/${stonfidata.pool}`)
            .url("✈️", `https://t.me/${stonfidata.telegram}`)
            .url("🐦", `https://twitter.com/${stonfidata.twitter}`)
            .row()
            .url("Stonfi Swap", `https://app.ston.fi/swap?&ft=TON&tt=${item}&fa=5&chartVisible=false`)
            .url("TON SWAP 1", `ton://transfer/${stonfidata.pool}?amount=${core_1.toNano(1)}&comment=Swap%20to%20${stonfidata.name}`)
            .url("TON SWAP 5", `ton://transfer/${stonfidata.pool}?amount=${core_1.toNano(5)}&comment=Swap%20to%20${stonfidata.name}`)
            .row()
            .switchInline("📋 Share Contract", item); // This creates a switch inline query button
        ctx.reply(messageInfo, {
            reply_markup: inlineKeyboard,
            parse_mode: "HTML",
        });
    }
}));
bot.command("start", (ctx) => {
    var _a;
    return ctx.reply(`Hello ${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.username}, You have successfully started a Telgram Bot: STON-APE!`, {
        reply_markup: {
            inline_keyboard: [[{ text: "CA Setup", callback_data: "ca_setup" }]],
        },
    });
});
bot.command("ca", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("caSetup");
}));
bot.callbackQuery("ca_setup", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("caSetup");
}));
bot.on(":text").hears("ape", (ctx) => {
    ctx.reply("🦍", {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "🦍", callback_data: "ape" },
                    { text: "Don't Ape", callback_data: "no" },
                ],
            ],
        },
    });
});
bot.callbackQuery("ape", (ctx) => {
    ctx.reply("We are gonna 🦍 it");
    ctx.conversation.exit("caSetup");
});
bot.callbackQuery("no", (ctx) => {
    ctx.reply("I guess you hate money 🤷‍♂️");
    ctx.conversation.exit("caSetup");
});
console.log("Bot is running...");
bot.start();
// StonFi();
// console.log("Running Stonfi");
