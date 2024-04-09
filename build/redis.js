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
exports.getGroupName = exports.clearPumpData = exports.getSolanaPrice = exports.storeSolanaPrice = exports.storeTokenInfo = exports.getTokenInfo = exports.getActivePumps = exports.getChatId = exports.getPumpData = exports.storePumpData = exports.getRedis = exports.setRedis = exports.client = void 0;
const dotenv = __importStar(require("dotenv"));
const ioredis_1 = require("ioredis");
const helius_1 = require("./helius");
dotenv.config();
const client = new ioredis_1.Redis(process.env.UPSTASH_URL);
exports.client = client;
const setRedis = (key, value) => __awaiter(void 0, void 0, void 0, function* () {
    client.set(key, value);
});
exports.setRedis = setRedis;
const getRedis = (key) => __awaiter(void 0, void 0, void 0, function* () {
    return client.get(key);
});
exports.getRedis = getRedis;
function storePumpData(contract_address, chat_id, group_name) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.sadd("active_pumps", contract_address);
        yield client.hset(contract_address, { chat_id: chat_id.toString(), group_name: group_name }, (err, res) => {
            if (err) {
                console.log(err);
            }
            console.log(res);
        });
        yield client.expire(contract_address, 36000);
        yield client.expire("active_pumps", 36000);
    });
}
exports.storePumpData = storePumpData;
function storeTokenInfo(contract_address, token_info) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.hset(contract_address, { token_info: JSON.stringify(token_info) }, (err, res) => {
            if (err) {
                console.log(err);
            }
            console.log(res);
        });
        yield client.expire(contract_address, 500);
    });
}
exports.storeTokenInfo = storeTokenInfo;
function getTokenInfo(contract_address) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield client.hget(contract_address, "token_info", (err, data) => {
            if (err)
                console.error(err);
            else
                console.log("TOKEN_INFO from redis", contract_address, data);
        });
        return data;
    });
}
exports.getTokenInfo = getTokenInfo;
function getPumpData(contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield client.hgetall(contractAddress, (err, data) => {
            if (err)
                console.error(err);
            else
                console.log("PumpData fromRedis", contractAddress, data);
        });
        return data;
    });
}
exports.getPumpData = getPumpData;
function getChatId(contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield client.hget(contractAddress, "chat_id", (err, data) => {
            if (err)
                console.error(err);
            else
                console.log("chat_id from reids", contractAddress, data);
        });
        return Promise.resolve(data);
    });
}
exports.getChatId = getChatId;
function getGroupName(contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield client.hget(contractAddress, "group_name", (err, data) => {
            if (err)
                console.error(err);
            else
                console.log("group_name from reids", contractAddress, data);
        });
        return Promise.resolve(data);
    });
}
exports.getGroupName = getGroupName;
function getActivePumps() {
    return __awaiter(this, void 0, void 0, function* () {
        // const data = await client.keys("*", (err, data) => {
        // 	if (err) console.error(err);
        // 	else console.log("Data for", data);
        // });
        // return data;
        const data = yield client.smembers("active_pumps", (err, data) => {
            if (err)
                console.error(err);
            else
                console.log("Data for", data);
        });
        return data;
    });
}
exports.getActivePumps = getActivePumps;
function clearPumpData(contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.del(contractAddress);
        yield client.srem("active_pumps", contractAddress);
        helius_1.updateWebhookAddresses();
    });
}
exports.clearPumpData = clearPumpData;
function storeSolanaPrice(price) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!price)
            return;
        if (price === null)
            return;
        yield client.set("solana_price", price.toString());
        yield client.expire("solana_price", 540);
    });
}
exports.storeSolanaPrice = storeSolanaPrice;
function getSolanaPrice() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield client.get("solana_price", (err, data) => {
            if (err)
                console.error(err);
            else
                console.log("Solana PRICE:", data);
        });
        return data;
    });
}
exports.getSolanaPrice = getSolanaPrice;
