// biome-ignore lint/style/useImportType: <explanation>
import { createNestEnvValidator, createTypedConfigService, z } from "./index";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.string().transform(Number).pipe(z.number().positive()),
	DATABASE_URL: z.string().url(),
});

export const validateEnv = createNestEnvValidator(envSchema);

export type Env = z.infer<typeof envSchema>;
export type TypedConfigService = ReturnType<
	typeof createTypedConfigService<typeof envSchema>
>;
