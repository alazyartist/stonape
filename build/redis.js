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
exports.getActivePumps = exports.getChatId = exports.getPumpData = exports.storePumpData = exports.getRedis = exports.setRedis = void 0;
const dotenv = __importStar(require("dotenv"));
const ioredis_1 = require("ioredis");
dotenv.config();
const client = new ioredis_1.Redis(process.env.UPSTASH_URL);
const setRedis = (key, value) => __awaiter(void 0, void 0, void 0, function* () {
    client.set(key, value);
});
exports.setRedis = setRedis;
const getRedis = (key) => __awaiter(void 0, void 0, void 0, function* () {
    return client.get(key);
});
exports.getRedis = getRedis;
function storePumpData(contract_address, chat_id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.sadd("active_pumps", contract_address);
        yield client.hset(contract_address, { chat_id: chat_id.toString() }, (err, res) => {
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
function getPumpData(contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield client.hgetall(contractAddress, (err, data) => {
            if (err)
                console.error(err);
            else
                console.log("Data for", contractAddress, data);
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
                console.log("Data for", contractAddress, data);
        });
        return Promise.resolve(data);
    });
}
exports.getChatId = getChatId;
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
