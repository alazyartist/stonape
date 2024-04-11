import * as dotenv from "dotenv";
import { MyContext } from "./bot";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { client } from "./redis";
dotenv.config();
async function checkWallet(ctx: MyContext, wallet_to_check: string) {
	const user_chat_id = ctx.from?.id as number;
	ctx.reply("Checking wallet, please wait...");
	await ctx.replyWithChatAction("typing");

	try {
		const data = await fetch(
			`https://api.helius.xyz/v0/addresses/WATcHGu7tvKrwp8SzNyp4Z2mB4sSEC8w6AyAwfh28A5/transactions?api-key=${process.env.HELIUS_KEY}&type=TRANSFER`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
		const transactions = await data.json();
		const whitelistSet = new Set();
		await transactions.forEach(async (transaction: HeliusTransaction) => {
			if (
				transaction.type === "TRANSFER" &&
				transaction.nativeTransfers.some(
					(t) =>
						t.toUserAccount === "WATcHGu7tvKrwp8SzNyp4Z2mB4sSEC8w6AyAwfh28A5"
				) &&
				transaction.nativeTransfers[0].amount >= LAMPORTS_PER_SOL * 0.1
			) {
				const fromUserAccount = transaction.nativeTransfers[0].fromUserAccount;
				await client.sadd("whitelist", fromUserAccount);
				if (whitelistSet.has(fromUserAccount)) {
					console.log(`${fromUserAccount} is in the new whitelist.`);
					client.sadd("whitelist", fromUserAccount);
					client.sadd("whitelist:chat_id", user_chat_id.toString());
					await ctx.reply(`Wallet ${fromUserAccount} has been whitelisted`);
				} else {
					console.log(transaction.description);
					await client.sadd("whitelist", fromUserAccount);
					await client.sadd("whitelist:chat_id", user_chat_id.toString());
					whitelistSet.add(fromUserAccount);
					console.log(`${fromUserAccount} added to the whitelist.`);
					// 					await ctx.reply(`
					// Wallet ${fromUserAccount} added to the whitelist.
					// You can now access the bot
					// Thank you for your support.`);
				}
			}
		});
		const wl_recheck = await client.smembers("whitelist");
		console.log(
			"check wallet",
			wl_recheck,
			wl_recheck.includes(wallet_to_check)
		);
		return wl_recheck.includes(wallet_to_check);
	} catch (err) {
		console.error(err);
		ctx.reply(
			"An error occured while checking the wallet, please notify @alazyartist"
		);
	}

	const wl = await client.smembers("whitelist");
	if (wl.includes(wallet_to_check)) {
		client.sadd("whitelist:chat_id", user_chat_id.toString());
		console.log("Wallet is whitelisted in redis");
		ctx.reply(`
Wallet ${wallet_to_check} added to the whitelist.
You can now access the bot
Thank you for your support.`);
	}
}

export default checkWallet;
// checkWallet();
export interface TransferDetail {
	fromUserAccount: string;
	toUserAccount: string;
	amount: number;
}

export interface AccountData {
	account: string;
	nativeBalanceChange: number;
	tokenBalanceChanges: any[]; // Replace 'any' with a more specific type if possible
}

export interface Instruction {
	accounts: string[];
	data: string;
	programId: string;
	innerInstructions: any[]; // Replace 'any' with a more specific type if available
}

export interface HeliusTransaction {
	description: string;
	type: string; // You can use a union type if there are specific known values
	source: string;
	fee: number;
	feePayer: string;
	signature: string;
	slot: number;
	timestamp: number;
	tokenTransfers: any[]; // Replace 'any' with a specific type if known
	nativeTransfers: TransferDetail[];
	accountData: AccountData[];
	transactionError: any | null; // Replace 'any' with a specific type if known
	instructions: Instruction[];
	events: any; // Replace 'any' with a more specific type if available
}
