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
exports.caSetup = void 0;
const grammy_1 = require("grammy");
const utils_1 = require("../utils");
const geckoTerminal_1 = require("../geckoTerminal");
const ynkeyboard = new grammy_1.InlineKeyboard().text("Yes", "yes").text("No", "no");
function caSetup(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.reply("Hello, I am ready for the ca");
        const { message } = yield conversation.wait();
        const contract_address = message === null || message === void 0 ? void 0 : message.text;
        try {
            const stonfidata = yield geckoTerminal_1.getTokenDetails(contract_address, "ton");
            console.log(stonfidata, "is the stonfidata");
            if (stonfidata !== undefined) {
                const messageInfo = `
			${stonfidata.name}
			${stonfidata.description}
			Pool Name: ${stonfidata.poolName}
			Pool Dex: ${stonfidata.poolDex}
			Symbol: ${stonfidata.symbol}
			Price: ${stonfidata.price}
			24h Volume: ${utils_1.convertToK(stonfidata.volume)}
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
exports.caSetup = caSetup;
