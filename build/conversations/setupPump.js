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
const helius_1 = require("../helius");
const redis_1 = require("../redis");
const utils_1 = require("../utils");
function setupPump(conversation, ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const telegram_user = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
        const admins = yield ctx.getChatAdministrators();
        const isAdmin = admins.some((admin) => admin.user.id === telegram_user);
        if (!isAdmin) {
            return yield ctx.reply("You are not an admin of this group.");
        }
        const tryAgainKeyboard = new grammy_1.InlineKeyboard().text("Try Again", "setup_pump");
        yield ctx.reply("To Setup PumpBot, you need to provide the contract address of the token. If you are adding this bot to a group.", {
            reply_markup: { force_reply: true },
        });
        const { message } = yield conversation.wait();
        const contract_address = message === null || message === void 0 ? void 0 : message.text;
        if (!utils_1.isSolanaAddress(contract_address)) {
            yield ctx.reply("Invalid contract address. Please try again.", {
                reply_markup: tryAgainKeyboard,
            });
            return;
        }
        const info = yield conversation.external(() => helius_1.getPumpTokenInfo(contract_address));
        const { image, name, description, symbol } = info;
        const keyboard = new grammy_1.InlineKeyboard().text("Yes", "yes").text("No", "no");
        yield ctx.replyWithPhoto(image, {
            caption: `You have provided the contract address: 
        <code>${contract_address}</code>
        Token Name: ${name}
        Token Symbol: ${symbol}
        Token Description: ${description}

        <b> Is this correct?</b>`,
            reply_markup: keyboard,
            parse_mode: "HTML",
        });
        yield conversation.waitForCallbackQuery(["yes", "no"]).then((ctx) => __awaiter(this, void 0, void 0, function* () {
            var _b, _c;
            if (((_b = ctx.callbackQuery) === null || _b === void 0 ? void 0 : _b.data) === "yes") {
                const chat_id = (_c = ctx.chat) === null || _c === void 0 ? void 0 : _c.id;
                yield redis_1.storePumpData(contract_address, chat_id);
                const addressAdded = yield conversation.external(() => helius_1.updateWebhookAddresses());
                if (!addressAdded) {
                    return yield ctx.reply("Failed to add address to webhook", {
                        reply_markup: tryAgainKeyboard,
                    });
                }
                yield ctx.reply("Setting up PumpBot...");
                yield ctx.reply("PumpBot has been successfully setup. You will now receive notifications for the token for 10 Hours.");
                yield ctx.reply("Please allow 2 to 3 minutes for the bot to start pulling in Buys.");
            }
            else {
                yield ctx.reply("PumpBot setup cancelled.");
            }
        }));
    });
}
exports.default = setupPump;
