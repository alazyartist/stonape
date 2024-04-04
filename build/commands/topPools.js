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
exports.topPools = void 0;
const grammy_1 = require("grammy");
const geckoTerminal_1 = require("../geckoTerminal");
const utils_1 = require("../utils");
function topPools(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const topPools = yield geckoTerminal_1.getTopPools("ton");
        if (!topPools) {
            ctx.reply("No top pools found");
            return;
        }
        const keyboard = new grammy_1.InlineKeyboard();
        const message = topPools
            .map((pool, index) => {
            keyboard.text(pool.name, `about ${pool.ca}`).row();
            return `${index + 1}. ${pool.name} - ${utils_1.convertToK(pool.volume)} - ${pool.price_change}%`;
        })
            .join("\n");
        ctx.reply("Select a Pool to Get More Info", {
            reply_markup: keyboard,
        });
    });
}
exports.topPools = topPools;
