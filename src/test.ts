// import { createEnvConfig, z } from ".";

// const { config, schema, createNestEnvValidator, createEnvGetter } =
// 	createEnvConfig(
// 		z.object({
// 			NODE_ENV: z
// 				.enum(["development", "production", "test"])
// 				.default("development"),
// 			PORT: z.coerce.number().positive(),
// 			DATABASE_URL: z.string().url(),
// 		}),
// 	);

// console.log(config.get("DATABASE_URL"));

// declare global {
// 	namespace NodeJS {
// 		interface ProcessEnv extends z.infer<typeof schema> {}
// 	}
// }

// const getEnv = createEnvGetter(schema);

// const validator = createNestEnvValidator(schema);

// const val = validator();
// console.log(val);
