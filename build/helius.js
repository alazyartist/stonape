"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
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
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function* () {
        const info = yield redis_1.getTokenInfo(contract_address);
        if (info) {
            return JSON.parse(info);
        }
        if (!info) {
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
            const metadata = (_b = (_a = data === null || data === void 0 ? void 0 : data.result) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.metadata;
            const image = (_e = (_d = (_c = data === null || data === void 0 ? void 0 : data.result) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.links) === null || _e === void 0 ? void 0 : _e.image;
            const newInfo = {
                name: metadata === null || metadata === void 0 ? void 0 : metadata.name,
                symbol: metadata === null || metadata === void 0 ? void 0 : metadata.symbol,
                description: metadata === null || metadata === void 0 ? void 0 : metadata.description,
                image: image,
                program_id: (_g = (_f = data === null || data === void 0 ? void 0 : data.result) === null || _f === void 0 ? void 0 : _f.token_info) === null || _g === void 0 ? void 0 : _g.token_program,
            };
            if (!newInfo.name ||
                !newInfo.symbol ||
                !newInfo.description ||
                !newInfo.image ||
                !newInfo.program_id) {
                console.error("No token info found for", contract_address);
                return null;
            }
            yield redis_1.storeTokenInfo(contract_address, newInfo);
            return newInfo;
        }
    });
}
exports.getPumpTokenInfo = getPumpTokenInfo;
//useful methods getTokenSupply  getTokenLargestAccounts
function updateWebhookAddresses() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("webhook id", WEBHOOK_ID);
        console.log("helius key", HELIUS_KEY);
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
