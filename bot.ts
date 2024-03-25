import * as dotenv from "dotenv";
import { Bot } from "grammy";
dotenv.config();
console.log(process.env?.TELEGRAM_TOKEN as string);
const bot = new Bot(process.env.TELEGRAM_TOKEN);
