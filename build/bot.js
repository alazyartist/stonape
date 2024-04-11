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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const dotenv = __importStar(require("dotenv"));
const conversations_1 = require("@grammyjs/conversations");
const grammy_1 = require("grammy");
const auto_retry_1 = require("@grammyjs/auto-retry");
const menu_1 = require("@grammyjs/menu");
const casetup_1 = require("./conversations/casetup");
const about_1 = __importDefault(require("./commands/about"));
const topPools_1 = require("./commands/topPools");
const setupPump_1 = __importDefault(require("./conversations/setupPump"));
const listPumps_1 = require("./commands/listPumps");
const removePump_1 = __importDefault(require("./conversations/removePump"));
const grammy_middlewares_1 = require("grammy-middlewares");
const whitelistMiddleware_1 = __importDefault(require("./whitelistMiddleware"));
const walletCheck_1 = __importDefault(require("./walletCheck"));
dotenv.config();
const BOT_TOKEN = process.env.MODE === "DEV"
    ? process.env.TELEGRAM_DEV_TOKEN
    : process.env.TELEGRAM_TOKEN;
exports.bot = new grammy_1.Bot(BOT_TOKEN);
// Use the plugin.
exports.bot.api.config.use(auto_retry_1.autoRetry({
    maxRetryAttempts: 4,
    maxDelaySeconds: 1000,
}));
exports.bot.use(grammy_middlewares_1.ignoreOld(60));
exports.bot.command("check_wallet", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const wallet = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.split(" ")[1];
    if (!wallet) {
        ctx.reply("Please enter a wallet address to check");
        return;
    }
    const wallet_check = yield walletCheck_1.default(ctx, wallet);
    Promise.resolve(wallet_check).then((value) => {
        console.log("walletCheck bot value", value);
        value
            ? ctx.reply("Wallet is on the whitelist")
            : ctx.reply(`Wallet is not whitelisted 
if you think this is an error, 
please try the command again, if the error persists,
please contact the dev @alazyartist`);
    });
}));
exports.bot.command("list_pumps", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield listPumps_1.listPumps(ctx);
}));
exports.bot.use((ctx, next) => whitelistMiddleware_1.default(ctx, next));
exports.bot.use(grammy_1.session({ initial: () => ({}) }));
exports.bot.use(conversations_1.conversations());
// bot.api.getMe().then(console.log).catch(console.error);
exports.bot.catch((err) => {
    err.ctx.reply("An error occurred, please try again, if the error persists, contact the dev @alazyartist");
    console.error(`Error for ${err.ctx.update.message}`, err);
    exports.bot.start();
});
exports.bot.use(conversations_1.createConversation(casetup_1.caSetup));
exports.bot.use(conversations_1.createConversation(about_1.default));
exports.bot.use(conversations_1.createConversation(setupPump_1.default));
exports.bot.use(conversations_1.createConversation(removePump_1.default));
exports.bot.api.setMyCommands([
    { command: "start", description: "Start the Bot" },
    { command: "list_pumps", description: "Get a List of Active Pumps" },
    // { command: "about", description: "Get information about a token" },
    // { command: "ape", description: "Make Aping Easy AF" },
    // { command: "top", description: "Get Top Pools on TON" },
    // { command: "ca", description: "Setup a contract address" },
    { command: "setup_pump", description: "Setup a PumpFun BuyBot" },
    { command: "remove_pump", description: "Remove a PumpFun BuyBot" },
    { command: "check_wallet", description: "Checks Whitelist" },
]);
const menu = new menu_1.Menu("main-menu").text("watch.it.pump", (ctx) => ctx.conversation.enter("setupPump"));
exports.bot.use(menu);
exports.bot.command("start", (ctx) => {
    var _a;
    return ctx.replyWithPhoto(new grammy_1.InputFile("./watchitpump.webp"), {
        caption: `Welcome ${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.username}, You have successfully started watch.it.pump!`,
        reply_markup: menu,
    });
});
exports.bot.command("ca", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("caSetup");
}));
// bot.command("test", async (ctx) => {
// 	// 	try {
// 	// 		const connection = new Connection(clusterApiUrl("mainnet-beta"));
// 	// 		// "DtFjJtZs1N1Mi1SR5aUyfigAT1ssLEUHeruZPF3QNy6F"
// 	const token_addr = new PublicKey(
// 		"4k6HZsdxbbyU3HnJzV9UB1DBEWWvsQewEMsQaW6mx1df"
// 	);
// 	const bonding_curve_addr = new PublicKey(
// 		"Ch6wJvWbNzZ2EAyPr63Wy4LxHzLroTa4JaDQx3YYJaVt"
// 	);
// 	const PROGRAM_ID = new PublicKey(
// 		"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
// 	);
// 	const bc = await calculateBondingCurve(
// 		token_addr,
// 		bonding_curve_addr,
// 		PROGRAM_ID
// 	);
// 	if (bc.progress_bar) ctx.reply(bc.progress_bar);
// 		// const token_mint = await getMint(connection, token_addr);
// 		// console.log("token_mint", token_mint);
// 		// const token_account = await connection.getTokenAccountBalance(token_addr);
// 		// console.log("tokenaccount", token_account);
// 		let token_account = await connection.getParsedTokenAccountsByOwner(
// 			bonding_curve_addr,
// 			{
// 				mint: token_addr,
// 			}
// 		);
// 		const token_account_addr = token_account.value[0].pubkey;
// 		console.log("tokenaccount", token_account.value[0].pubkey);
// 		const token_supply = await connection.getTokenAccountBalance(
// 			token_account_addr
// 		);
// 		console.log("token_supply", token_supply);
// 		const total_supply = token_supply.value.uiAmount;
// 		console.log(total_supply);
// 		ctx.reply("test ran");
// 		ctx.reply("total_supply is " + total_supply);
// 	} catch (err) {
// 		console.log(err);
// 		ctx.reply("An error occurred");
// 	}
// });
exports.bot.command("top", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield topPools_1.topPools(ctx);
}));
exports.bot.command("about", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("aboutToken");
}));
exports.bot.command("chatid", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    console.log((_c = ctx.chat) === null || _c === void 0 ? void 0 : _c.id);
}));
exports.bot.command("setup_pump", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("setupPump");
}));
exports.bot.command("remove_pump", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("removePump");
}));
exports.bot.callbackQuery("about", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(ctx.match);
}));
exports.bot.callbackQuery("ca_setup", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("caSetup");
}));
exports.bot.callbackQuery("setup_pump", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("setupPump");
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
    console.log(ctx);
    console.log(ctx.chat);
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
