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
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(ctx.update.message.chat);
        // await ctx.reply(`Checking if ${ctx.from.username} is whitelisted`);
        const newMembers = (_b = (_a = ctx.update) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.new_chat_members;
        const leftMember = (_d = (_c = ctx.update) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.left_chat_member;
        if (newMembers) {
            console.log(newMembers);
            newMembers.forEach((member) => __awaiter(this, void 0, void 0, function* () {
                if (member.username) {
                    yield ctx.reply(`Welcome to ${ctx.chat.title}, ${member.username}.`);
                }
            }));
            return; // Stop processing further for new member updates
        }
        if (leftMember) {
            console.log(leftMember);
            // Handle left member logic if needed
            return; // Stop processing further for member leaving updates
        }
        // Continue with whitelist checking for other updates
        if (!ctx.from) {
            yield ctx.reply("I cannot determine who you are, please try again.");
            return;
        }
        // const whitelist = [6974865060];
        const whitelist = yield redis_1.client.smembers("whitelist:chat_id");
        const onWhitelist = whitelist.includes((_e = ctx === null || ctx === void 0 ? void 0 : ctx.from) === null || _e === void 0 ? void 0 : _e.id.toString());
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

run command /check_wallet@ston_ape_bot wallet_you_paid_with
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
