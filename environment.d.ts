declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TELEGRAM_TOKEN: string;
			TONCENTER_TOKEN: string;
			UPSTASH_PASS: string;
			UPSTASH_URL: string;
			HELIUS_KEY: string;
			WEBHOOK_ID: string;
			WEBHOOK_URL: string;
		}
	}
}

export {};
