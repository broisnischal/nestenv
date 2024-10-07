import { z } from "zod";

export const commonEnvs = {
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().positive(),
	LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
};

export const databaseEnvs = {
	DATABASE_URL: z.string().url(),
	DATABASE_SSL: z.coerce.boolean().default(false),
};

export const awsEnvs = {
	AWS_ACCESS_KEY_ID: z.string().min(1),
	AWS_SECRET_ACCESS_KEY: z.string().min(1),
	AWS_REGION: z.string().min(1),
};

export const authEnvs = {
	JWT_SECRET: z.string().min(32),
	JWT_EXPIRATION: z.string().regex(/^\d+[smhd]$/),
};

export function createPresetSchema(...presets: z.ZodRawShape[]) {
	return z.object(Object.assign({}, ...presets));
}
