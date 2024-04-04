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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const conversations_1 = require("@grammyjs/conversations");
const grammy_1 = require("grammy");
const menu_1 = require("@grammyjs/menu");
const casetup_1 = require("./conversations/casetup");
const about_1 = __importDefault(require("./commands/about"));
const topPools_1 = require("./commands/topPools");
dotenv.config();
console.log((_a = process.env) === null || _a === void 0 ? void 0 : _a.TELEGRAM_TOKEN);
const bot = new grammy_1.Bot(process.env.TELEGRAM_TOKEN);
bot.use(grammy_1.session({ initial: () => ({}) }));
bot.use(conversations_1.conversations());
// bot.api.getMe().then(console.log).catch(console.error);
bot.catch((err) => {
    err.ctx.reply("An error occurred, please try again");
    console.error(`Error for ${err.ctx.update.message}`, err);
    bot.start();
});
bot.use(conversations_1.createConversation(casetup_1.caSetup));
bot.use(conversations_1.createConversation(about_1.default));
bot.api.setMyCommands([
    { command: "about", description: "Get information about a token" },
    { command: "ape", description: "Make Aping Easy AF" },
    { command: "top", description: "Get Top Pools on TON" },
    { command: "ca", description: "Setup a contract address" },
]);
const menu = new menu_1.Menu("main-menu")
    .text("🦍", (ctx) => ctx.reply("Ape Setup"))
    .row()
    .text("ca", (ctx) => ctx.conversation.enter("caSetup"));
bot.use(menu);
bot.command("start", (ctx) => {
    var _a;
    return ctx.reply(`Hello ${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.username}, You have successfully started a Telgram Bot: STON-APE!`, {
        reply_markup: menu,
    });
});
bot.command("ca", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("caSetup");
}));
bot.command("top", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield topPools_1.topPools(ctx);
}));
bot.command("about", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("aboutToken");
}));
bot.callbackQuery("about", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(ctx.match);
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
