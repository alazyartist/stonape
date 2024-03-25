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
const conversations_1 = require("@grammyjs/conversations");
const grammy_1 = require("grammy");
dotenv.config();
console.log((_a = process.env) === null || _a === void 0 ? void 0 : _a.TELEGRAM_TOKEN);
const bot = new grammy_1.Bot(process.env.TELEGRAM_TOKEN);
bot.use(grammy_1.session({ initial: () => ({}) }));
bot.use(conversations_1.conversations());
// bot.api.getMe().then(console.log).catch(console.error);
const ynkeyboard = new grammy_1.InlineKeyboard().text("Yes", "yes").text("No", "no");
function caSetup(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.reply("Hello, I am a bot that can help you with your ape needs");
        const { message } = yield conversation.wait();
        yield ctx.reply(`You want to ape: ${message === null || message === void 0 ? void 0 : message.text}`, {
            reply_markup: ynkeyboard,
        });
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
bot.command("start", (ctx) => ctx.reply("Hello Dylan, You have successfully started a Telgram Bot: STON-APE!", {
    reply_markup: {
        inline_keyboard: [[{ text: "CA Setup", callback_data: "ca_setup" }]],
    },
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
});
bot.callbackQuery("no", (ctx) => {
    ctx.reply("I guess you hate money 🤷‍♂️");
});
console.log("Bot is running...");
bot.start();
