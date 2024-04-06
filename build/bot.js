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
exports.bot = void 0;
const dotenv = __importStar(require("dotenv"));
const conversations_1 = require("@grammyjs/conversations");
const grammy_1 = require("grammy");
const menu_1 = require("@grammyjs/menu");
const casetup_1 = require("./conversations/casetup");
const about_1 = __importDefault(require("./commands/about"));
const topPools_1 = require("./commands/topPools");
const setupPump_1 = __importDefault(require("./conversations/setupPump"));
const listPumps_1 = require("./commands/listPumps");
dotenv.config();
console.log((_a = process.env) === null || _a === void 0 ? void 0 : _a.TELEGRAM_TOKEN);
exports.bot = new grammy_1.Bot(process.env.TELEGRAM_TOKEN);
exports.bot.use(grammy_1.session({ initial: () => ({}) }));
exports.bot.use(conversations_1.conversations());
// bot.api.getMe().then(console.log).catch(console.error);
exports.bot.catch((err) => {
    err.ctx.reply("An error occurred, please try again");
    console.error(`Error for ${err.ctx.update.message}`, err);
    exports.bot.start();
});
exports.bot.use(conversations_1.createConversation(casetup_1.caSetup));
exports.bot.use(conversations_1.createConversation(about_1.default));
exports.bot.use(conversations_1.createConversation(setupPump_1.default));
exports.bot.api.setMyCommands([
    { command: "start", description: "Start the Bot" },
    { command: "list_pumps", description: "Get a List of Active Pumps" },
    { command: "about", description: "Get information about a token" },
    // { command: "ape", description: "Make Aping Easy AF" },
    { command: "top", description: "Get Top Pools on TON" },
    { command: "ca", description: "Setup a contract address" },
    { command: "setup_pump", description: "Setup a PumpFun BuyBot" },
]);
const menu = new menu_1.Menu("main-menu")
    .text("🦍", (ctx) => ctx.reply("Ape Setup"))
    .row()
    .text("watch.it.pump", (ctx) => ctx.conversation.enter("setupPump"));
exports.bot.use(menu);
exports.bot.command("start", (ctx) => {
    var _a;
    return ctx.reply(`Welcome ${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.username}, You have successfully started the ston_ape_bot!`, {
        reply_markup: menu,
    });
});
exports.bot.command("ca", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("caSetup");
}));
exports.bot.command("top", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield topPools_1.topPools(ctx);
}));
exports.bot.command("about", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("aboutToken");
}));
exports.bot.command("list_pumps", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield listPumps_1.listPumps(ctx);
}));
exports.bot.command("chatid", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    console.log((_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id);
}));
exports.bot.command("setup_pump", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("setupPump");
}));
exports.bot.callbackQuery("about", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(ctx.match);
}));
exports.bot.callbackQuery("ca_setup", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("caSetup");
}));
exports.bot.on(":text").hears("ape", (ctx) => {
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
exports.bot.on(":text", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(ctx.message);
}));
exports.bot.on(":text").hears("watch.it.pump", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("setupPump");
}));
exports.bot.callbackQuery("ape", (ctx) => {
    ctx.reply("We are gonna 🦍 it");
    ctx.conversation.exit("caSetup");
});
exports.bot.callbackQuery("no", (ctx) => {
    ctx.reply("I guess you hate money 🤷‍♂️");
    ctx.conversation.exit("*");
});
console.log("Bot is running...");
