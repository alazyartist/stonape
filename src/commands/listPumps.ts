import { InlineKeyboard } from "grammy";
import { MyContext } from "../bot";
import { convertToK, calculateBondingCurve } from "../utils";
import { getActivePumps } from "../redis";
import { getPumpTokenInfo } from "../helius";
import { getChatId, getGroupName,client } from "../redis.js";
export async function listPumps(ctx: MyContext) {
	const active_pumps = await getActivePumps();
	if (!active_pumps || active_pumps.length === 0) {
		ctx.reply("No Active Pumps found");
		return;
	}

	const keyboard = new InlineKeyboard();
	const infoPromises = active_pumps.map((ca) => getPumpTokenInfo(ca));
	const tokenAddrPromises = active_pumps.map(async (ca) => {
	const token_addr = await client.hget(ca, "token_account")
	if(token_addr) return token_addr;
	// if(token_addr === null){
	// 	const connection = new Connection(clusterApiUrl("mainnet-beta"));
	// 	let token_account = await connection.getParsedTokenAccountsByOwner(owner, {
	// 		mint: ca,
	// 	}); 
	// 	const token_account_addr = token_account.value[0].pubkey;
	// 	await client.hset(
	// 		ca,
	// 		"token_account",
	// 		token_account_addr.toBase58()
	// 	);
	// 	return token_account_addr.toBase58();
	// }
	});
	const chatIdPromises = active_pumps.map((ca) => getChatId(ca));
	const groupNamePromises = active_pumps.map((ca) => getGroupName(ca));

	try {
		const infos = await Promise.all(infoPromises);
		const chatIds = await Promise.all(chatIdPromises);
		const groupNames = await Promise.all(groupNamePromises);
		const message = await Promise.all(infos
			.map(async (data, index) => {
				const bonding_curve = await calculateBondingCurve(
					active_pumps[index],
					tokenAddrPromises[index],
					infos[index].program_id
				);
				console.log(	active_pumps[index],
					tokenAddrPromises[index],
										infos[index].program_id)
				const group_name = groupNames[index]
				const percent = bonding_curve?.percent ?bonding_curve.percent :'idk Maybe';
				const progress = bonding_curve?.progress ?bonding_curve?.progress:'🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜';
				keyboard.url(data.name, `https://pump.fun/${active_pumps[index]}`).row();
				return `
${index + 1}. ${data.name} 
${percent}- 
${progress} - ${data.description.slice(0, 100)}...`;
			}))
			
		const joined_message =	message.join("\n";

		ctx.reply(joined_message, {
			reply_markup: keyboard,
		}))
	} catch (error) {
		console.error("Error fetching pump token info:", error);
		ctx.reply("Error encountered while fetching active pumps.");
	}
}
