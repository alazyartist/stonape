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
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        if (((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.type) === "private") {
            return yield ctx.reply("You need to add the bot to a group to setup watch.it.pump, once added to a group, type /start@ston_ape_bot. If this is a SuperGroup or Channel, please give the bot admin rights.", {
                reply_markup: new grammy_1.InlineKeyboard().url("Add Bot To Group", "https://t.me/ston_ape_test_bot?startgroup=true"),
            });
        }
        const telegram_user = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id;
        const telegram_username = (_c = ctx.from) === null || _c === void 0 ? void 0 : _c.username;
        const admins = yield utils_1.getChatAdministrators((_d = ctx.chat) === null || _d === void 0 ? void 0 : _d.id);
        const isAdmin = admins.some((admin) => admin.user.id === telegram_user);
        if (!isAdmin) {
            return yield ctx.reply("You are not an admin of this group.");
        }
        if (isAdmin) {
            const tryAgainKeyboard = new grammy_1.InlineKeyboard().text("Try Again", "setup_pump");
            yield ctx.reply(`@${telegram_username} To Setup PumpBot, you need to provide the contract address of the token.`, {
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
            const { image, name, description, symbol } = info;
            const keyboard = new grammy_1.InlineKeyboard().text("Yes", "yes").text("No", "no");
            const description_prev = description.slice(0, 60);
            const utfDescript = Buffer.from(description_prev, "utf-8").toString("utf-8");
            yield ctx.replyWithPhoto(image, {
                caption: `You have provided the contract address: 
        <code>${contract_address}</code>
        Token Name: ${name}
        Token Symbol: ${symbol}
        Token Description: ${utfDescript}...

        <b> Is this correct?</b>`,
                reply_markup: keyboard,
                parse_mode: "HTML",
            });
            yield conversation.waitForCallbackQuery(["yes", "no"]).then((ctx) => __awaiter(this, void 0, void 0, function* () {
                var _e, _f, _g;
                if (((_e = ctx.callbackQuery) === null || _e === void 0 ? void 0 : _e.data) === "yes") {
                    const chat_id = (_f = ctx.chat) === null || _f === void 0 ? void 0 : _f.id;
                    const group_name = (_g = ctx.chat) === null || _g === void 0 ? void 0 : _g.id.toString();
                    yield redis_1.storePumpData(contract_address, chat_id, group_name);
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
        }
    });
}
exports.default = setupPump;
