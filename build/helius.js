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
exports.updateWebhookAddresses = exports.getPumpTokenInfo = void 0;
const redis_1 = require("./redis");
const WEBHOOK_ID = process.env.MODE === "DEV"
    ? process.env.WEBHOOK_DEV_ID
    : process.env.WEBHOOK_ID;
const WEBHOOK_URL = process.env.MODE === "DEV"
    ? process.env.WEBHOOK_DEV_URL
    : process.env.WEBHOOK_URL;
const HELIUS_KEY = process.env.MODE === "DEV"
    ? process.env.HELIUS_DEV_KEY
    : process.env.HELIUS_KEY;
function getPumpTokenInfo(contract_address) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: "text",
                method: "getAsset",
                params: { id: contract_address },
            }),
        });
        const data = yield response.json();
        console.log(data.result);
        const metadata = data.result.content.metadata;
        const image = data.result.content.links.image;
        return {
            name: metadata.name,
            symbol: metadata.symbol,
            description: metadata.description,
            image: image,
        };
    });
}
exports.getPumpTokenInfo = getPumpTokenInfo;
//useful methods getTokenSupply  getTokenLargestAccounts
function updateWebhookAddresses() {
    return __awaiter(this, void 0, void 0, function* () {
        const addresses = yield redis_1.getActivePumps();
        const response = yield fetch(`https://api.helius.xyz/v0/webhooks/${WEBHOOK_ID}?api-key=${HELIUS_KEY}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                webhookUrl: WEBHOOK_URL,
                transactionTypes: ["TRANSFER", "SWAP"],
                accountAddresses: addresses,
                webhookType: "enhanced",
            }),
        });
        const data = yield response.json();
        if (data.error) {
            console.error("Error adding address to webhook:", data.error);
            return false;
        }
        console.log("Webhook EDITED response:", data);
        return true;
    });
}
exports.updateWebhookAddresses = updateWebhookAddresses;
