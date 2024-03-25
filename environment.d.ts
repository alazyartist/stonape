declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TELEGRAM_TOKEN: string;
			TONCENTER_TOKEN: string;
		}
	}
}

export {};
