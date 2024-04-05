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
const redis_1 = require("../redis");
function setupPump(conversation, ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.reply("To Setup PumpBot, you need to provide the contract address of the token.");
        const { message } = yield conversation.wait();
        const contract_address = message === null || message === void 0 ? void 0 : message.text;
        const chat_id = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
        yield ctx.reply(`You have provided the contract address: ${contract_address} and chat id: ${chat_id}`);
        yield ctx.reply("Setting up PumpBot...");
        yield redis_1.storePumpData(contract_address, chat_id);
        yield ctx.reply("PumpBot has been successfully setup. You will now receive notifications for the token.");
    });
}
exports.default = setupPump;
