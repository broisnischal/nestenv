import { z } from "zod";
import { ConfigService } from "@nestjs/config";

// @mat
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export function createNestEnvValidator<T extends z.ZodType>(
	schema: T,
	options: { logErrors?: boolean; throwOnError?: boolean } = {},
): () => z.infer<T> {
	return () => {
		const result = schema.safeParse(process.env);

		if (!result.success) {
			if (options.logErrors !== false) {
				console.error(
					"❌ Invalid environment variables:",
					result.error.format(),
				);
			}
			if (options.throwOnError !== false) {
				throw new Error("Invalid environment variables");
			}
		}

		return result.success ? result.data : process.env;
	};
}

export function createTypedConfigService<T extends z.ZodType>(schema: T) {
	return ConfigService<z.infer<T>, true>;
}

export function createEnvGetter<T extends z.ZodType>(schema: T) {
	return (key: keyof z.infer<T>) => {
		const result = schema.safeParse(process.env);
		if (!result.success) {
			throw new Error(`Invalid value for environment variable ${String(key)}`);
		}
		return result.data[key];
	};
}

export function createEnvConfig<T extends z.ZodType>(schema: T) {
	type Env = z.infer<T>;

	// type TypedConfigService = ConfigService<Env, true>;

	const config = new ConfigService<Env, true>();

	return {
		createNestEnvValidator,
		config,
		schema,
		createEnvGetter,
	};
}

export { z };