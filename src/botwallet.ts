// import {
// 	Keypair,
// 	Connection,
// 	Transaction,
// 	SystemProgram,
// } from "@solana/web3.js";

// async function createAndSendTransaction(
// 	recipientAddress: string,
// 	amount: number
// ) {
// 	// Generate a new keypair for the temporary wallet
// 	const temporaryWallet = Keypair.generate();

// 	// Connect to the Solana network
// 	const connection = new Connection("https://api.mainnet-beta.solana.com");

// 	// Get the balance of the temporary wallet
// 	const balance = await connection.getBalance(temporaryWallet.publicKey);

// 	// Create a transaction that sends the balance to the recipient address
// 	const transaction = new Transaction().add(
// 		SystemProgram.transfer({
// 			fromPubkey: temporaryWallet.publicKey,
// 			toPubkey: recipientAddress,
// 			lamports: balance - 10000, // Subtract a small fee for the transaction
// 		})
// 	);

// 	// Sign the transaction with the temporary wallet's private key
// 	transaction.sign(temporaryWallet);

// 	// Send the transaction to the Solana network
// 	const signature = await connection.sendTransaction(transaction);

// 	console.log(`Transaction sent with signature: ${signature}`);
// }

// // Usage example
// const recipientAddress = "YOUR_RECIPIENT_ADDRESS";
// const amount = 100; // Amount in lamports

// createAndSendTransaction(recipientAddress, amount);
