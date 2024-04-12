import { Context, NextFunction } from "grammy";
import { client } from "./redis";
export default async function isWhitelisted(
	ctx: Context,
	next: NextFunction // is an alias for: () => Promise<void>
): Promise<void> {
	// console.log(ctx.update.message.chat);
	if (!ctx.chat) return;
	// await ctx.reply(`Checking if ${ctx.from.username} is whitelisted`);
	const newMembers = ctx.update?.message?.new_chat_members;
	const leftMember = ctx.update?.message?.left_chat_member;
	const title = ["group", "supergroup", "channel"].includes(ctx?.chat?.type)
		? ctx?.chat?.title
		: "this chat";
	if (newMembers) {
		console.log(newMembers);
		newMembers.forEach(async (member) => {
			if (member.username) {
				await ctx.reply(`Welcome to ${title}, ${member.username}.`);
			}
		});
		return; // Stop processing further for new member updates
	}

	if (leftMember) {
		console.log(leftMember);
		// Handle left member logic if needed
		return; // Stop processing further for member leaving updates
	}

	// Continue with whitelist checking for other updates
	if (!ctx.from) {
		await ctx.reply("I cannot determine who you are, please try again.");
		return;
	}
	// const whitelist = [6974865060];
	const whitelist = await client.smembers("whitelist:chat_id");
	const onWhitelist = whitelist.includes(ctx?.from?.id.toString());
	if (!onWhitelist) {
		await ctx.reply(
			`
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
        `,
			{
				parse_mode: "HTML",
			}
		);
		return;
	}
	if (!!onWhitelist) {
		await next();
	}
}
