import { ConfigService } from "@nestjs/config";
import { z } from "zod";

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type RemoveOptional<T> = {
	[K in keyof T]-?: T[K] extends undefined ? never : T[K];
};

// Add this type helper
export type StrictRequired<T> = {
	[K in keyof T]-?: T[K] extends object ? StrictRequired<T[K]> : T[K];
};

function convertToNumber(value: unknown): number | unknown {
	if (typeof value === "string") {
		const num = Number(value);
		return Number.isNaN(num) ? value : num;
	}
	return value;
}

const zodNumberFromString = z.preprocess(convertToNumber, z.number());

export function createNestEnvValidator<T extends z.ZodType>(
	schema: T,
	options: {
		logErrors?: boolean;
		throwOnError?: boolean;
		useDefaults?: boolean;
	} = {},
): () => z.infer<T> {
	return () => {
		const parseOptions: z.ParseParams = {
			path: [],
			errorMap: (issue, ctx) => {
				return {
					message: `Invalid value for environment variable ${issue.path.join(".")}`,
				};
			},
			async: false,
		};
		if (options.useDefaults !== false) {
			parseOptions.path = [];
		}

		// Preprocess the schema to handle number conversions
		const preprocessedSchema = z.preprocess((obj) => {
			if (typeof obj === "object" && obj !== null) {
				return Object.fromEntries(
					Object.entries(obj).map(([key, value]) => {
						// @ts-ignore
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						const fieldSchema = (schema as any).shape?.[key];
						if (fieldSchema instanceof z.ZodNumber) {
							return [key, convertToNumber(value)];
						}
						return [key, value];
					}),
				);
			}
			return obj;
		}, schema);

		const result = preprocessedSchema.safeParse(process.env, parseOptions);

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
	type Env = StrictRequired<z.infer<T>>;

	const config = new ConfigService<Env, true>();

	const validateConfig = (config: Record<string, unknown>) => {
		const result = schema.safeParse(config);
		if (!result.success) {
			throw new Error(`Config validation error: ${result.error.toString()}`);
		}
		return result.data as Env;
	};

	const validate = createNestEnvValidator(schema);

	const parsedSchema = z.preprocess(validate, schema) as z.ZodType<Env>;

	return {
		validate,
		config,
		parsedSchema,
		schema,
		validateConfig,
	};
}

export { z, zodNumberFromString };
