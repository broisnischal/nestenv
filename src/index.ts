import { z } from "zod";
import { ConfigService } from "@nestjs/config";

export function createNestEnvValidator<T extends z.ZodType>(schema: T) {
	return () => {
		const result = schema.safeParse(process.env);

		if (!result.success) {
			console.error("❌ Invalid environment variables:", result.error.format());
			throw new Error("Invalid environment variables");
		}

		return result.data;
	};
}

export function createTypedConfigService<T extends z.ZodType>(schema: T) {
	return ConfigService<z.infer<T>, true>;
}

// Re-export zod for convenience
export { z };
