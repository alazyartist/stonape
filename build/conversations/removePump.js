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
function removePump(conversation, ctx) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const telegram_user = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
        const telegram_username = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.username;
        const admins = yield ctx.getChatAdministrators();
        const isAdmin = admins.some((admin) => admin.user.id === telegram_user);
        if (!isAdmin) {
            return yield ctx.reply("You are not an admin of this group.");
            return;
        }
        if (isAdmin) {
            const tryAgainKeyboard = new grammy_1.InlineKeyboard().text("Try Again", "setup_pump");
            yield ctx.reply(`@${telegram_username} To Remove PumpBot, you need to provide the contract address of the token. If you are adding this bot to a group.`, {
                reply_markup: { force_reply: true, selective: true },
            });
            const { message } = yield conversation.wait();
            const contract_address = message === null || message === void 0 ? void 0 : message.text;
            if (!utils_1.isSolanaAddress(contract_address)) {
                return yield ctx.reply("Invalid contract address. Please try again.", {
                    reply_markup: tryAgainKeyboard,
                });
            }
            const info = yield conversation.external(() => helius_1.getPumpTokenInfo(contract_address));
            console.log(info);
            if (!info) {
                return yield ctx.reply("Token Information not found. Please try again.", {
                    reply_markup: tryAgainKeyboard,
                });
            }
            const { image, name, description, symbol } = info;
            const keyboard = new grammy_1.InlineKeyboard().text("Yes", "yes").text("No", "no");
            let group_name = ctx.from.username;
            if (ctx.chat.type === "group") {
                group_name = ctx.chat.title;
            }
            yield ctx.replyWithPhoto(image, {
                caption: `You have provided the contract address: 
        <code>${contract_address}</code>
        Token Name: ${name}
        Token Symbol: ${symbol}
        Token Description: ${description.slice(0, 40)}...

		<b> You want to remove from ${group_name}</b>
        <b> Is this correct?</b>`,
                reply_markup: keyboard,
                parse_mode: "HTML",
            });
            yield conversation.waitForCallbackQuery(["yes", "no"]).then((ctx) => __awaiter(this, void 0, void 0, function* () {
                var _c, _d;
                if (((_c = ctx.callbackQuery) === null || _c === void 0 ? void 0 : _c.data) === "yes") {
                    const chat_id = (_d = ctx.chat) === null || _d === void 0 ? void 0 : _d.id;
                    yield redis_1.clearPumpData(contract_address);
                    const addressRemoved = yield conversation.external(() => helius_1.updateWebhookAddresses());
                    yield ctx.reply("Cleaning Up PumpBot...");
                    if (!addressRemoved) {
                        yield ctx.reply(`Failed to remove address from webhook
					
					if this persists please notify @alazyartist
					your group will no longer receive pump notifications.
					`, {
                            reply_markup: tryAgainKeyboard,
                        });
                    }
                    yield ctx.reply("PumpBot has been successfully stopped. You can start it again by using /setup_pump.");
                    yield ctx.reply(`Please allow 2 to 3 minutes for the bot to stop pulling in Buys.
					WE HOPE YOU ENJOYED IT!
					`);
                }
                else {
                    yield ctx.reply("PumpBot setup cancelled.");
                }
            }));
        }
    });
}
exports.default = removePump;
