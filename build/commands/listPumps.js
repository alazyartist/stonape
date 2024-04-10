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
exports.listPumps = void 0;
const grammy_1 = require("grammy");
const utils_1 = require("../utils");
const redis_1 = require("../redis");
const helius_1 = require("../helius");
const redis_js_1 = require("../redis.js");
function listPumps(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const active_pumps = yield redis_1.getActivePumps();
        if (!active_pumps || active_pumps.length === 0) {
            ctx.reply("No Active Pumps found");
            return;
        }
        const keyboard = new grammy_1.InlineKeyboard();
        const infoPromises = active_pumps.map((ca) => helius_1.getPumpTokenInfo(ca));
        const tokenAddrPromises = active_pumps.map((ca) => __awaiter(this, void 0, void 0, function* () { return yield redis_js_1.client.hget(ca, "token_account"); }));
        const chatIdPromises = active_pumps.map((ca) => redis_js_1.getChatId(ca));
        const groupNamePromises = active_pumps.map((ca) => redis_js_1.getGroupName(ca));
        try {
            const infos = yield Promise.all(infoPromises);
            const chatIds = yield Promise.all(chatIdPromises);
            const groupNames = yield Promise.all(groupNamePromises);
            const message = yield Promise.all(infos
                .map((data, index) => __awaiter(this, void 0, void 0, function* () {
                const bonding_curve = yield utils_1.calculateBondingCurve(active_pumps[index], tokenAddrPromises[index], infos[index].program_id);
                console.log(active_pumps[index], tokenAddrPromises[index], infos[index].program_id);
                const group_name = groupNames[index];
                const percent = (bonding_curve === null || bonding_curve === void 0 ? void 0 : bonding_curve.percent) ? bonding_curve.percent : 'idk Maybe';
                const progress = (bonding_curve === null || bonding_curve === void 0 ? void 0 : bonding_curve.progress) ? bonding_curve === null || bonding_curve === void 0 ? void 0 : bonding_curve.progress : '🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜';
                keyboard.url(data.name, `https://pump.fun/${active_pumps[index]}`).row();
                return `
				${index + 1}. ${data.name} 
				${percent}- ${progress} - ${data.description}`;
            })));
            const joined_message = message.join("\n");
            ctx.reply(joined_message, {
                reply_markup: keyboard,
            });
        }
        catch (error) {
            console.error("Error fetching pump token info:", error);
            ctx.reply("Error encountered while fetching active pumps.");
        }
    });
}
exports.listPumps = listPumps;
