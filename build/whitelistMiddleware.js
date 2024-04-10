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
const redis_1 = require("./redis");
function isWhitelisted(ctx, next // is an alias for: () => Promise<void>
) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        // await ctx.reply(`Checking if ${ctx.from.username} is whitelisted`);
        if (!ctx.from)
            return;
        if (!((_a = ctx === null || ctx === void 0 ? void 0 : ctx.from) === null || _a === void 0 ? void 0 : _a.id)) {
            yield ctx.reply("I cannot determine who you are, please try again.");
        }
        // const whitelist = [6974865060];
        const whitelist = yield redis_1.client.smembers("whitelist:chat_id");
        const onWhitelist = whitelist.includes((_b = ctx === null || ctx === void 0 ? void 0 : ctx.from) === null || _b === void 0 ? void 0 : _b.id.toString());
        if (!onWhitelist) {
            yield ctx.reply(`
You are not whitelisted, 

please contact the dev @alazyartist to gain access.
            
or allternatively you can send 
        
<strong>0.1 SOL</strong>
    
to the following address to gain access:
<code>WATcHGu7tvKrwp8SzNyp4Z2mB4sSEC8w6AyAwfh28A5</code>
    
If you have sent it but are still not whitelisted,
please contact the dev @alazyartist

run command /check_wallet@ston_ape_bot your_contract_address
to check if you are whitelisted and update the whitelist with your telegram id
        `, {
                parse_mode: "HTML",
            });
            return;
        }
        if (!!onWhitelist) {
            yield next();
        }
    });
}
exports.default = isWhitelisted;
