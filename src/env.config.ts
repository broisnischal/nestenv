import { ConfigService } from "@nestjs/config";
import type { Env } from "./env";

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Env {}
	}
}

export const config = new ConfigService<Env, true>();
