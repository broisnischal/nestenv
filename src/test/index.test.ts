import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
	createEnvConfig,
	createEnvGetter,
	createNestEnvValidator,
	createTypedConfigService,
} from "..";
import { commonEnvs, createPresetSchema, databaseEnvs } from "../presets";

describe("Environment Configuration Utilities", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe("createNestEnvValidator", () => {
		it("should validate correct environment variables", () => {
			process.env.NODE_ENV = "production";
			// @ts-expect-error - process.env is not typed
			process.env.PORT = "3000";

			const schema = z.object({
				NODE_ENV: z.enum(["development", "production", "test"]),
				PORT: z.coerce.number(),
			});

			const validate = createNestEnvValidator(schema);
			const result = validate();

			expect(result).toEqual({
				NODE_ENV: "production",
				PORT: 3000, // Note: This is now a number, not a string
			});
		});

		it("should throw an error for invalid environment variables", () => {
			// @ts-expect-error - process.env is not typed
			process.env.NODE_ENV = "invalid";

			const schema = z.object({
				NODE_ENV: z.enum(["development", "production", "test"]),
			});

			const validate = createNestEnvValidator(schema);

			expect(() => validate()).toThrow("Invalid environment variables");
		});

		it("should not throw an error when throwOnError is false", () => {
			// @ts-expect-error - process.env is not typed
			process.env.NODE_ENV = "invalid";

			const schema = z.object({
				NODE_ENV: z.enum(["development", "production", "test"]),
			});

			const validate = createNestEnvValidator(schema, { throwOnError: false });

			expect(() => validate()).not.toThrow();
		});
	});

	describe("createTypedConfigService", () => {
		it("should return a typed ConfigService", () => {
			const schema = z.object({
				PORT: z.coerce.number(),
			});

			const TypedConfigService = createTypedConfigService(schema);
			expect(TypedConfigService).toBeDefined();
		});
	});

	describe("createEnvGetter", () => {
		it("should return a function that gets environment variables", () => {
			// @ts-expect-error - process.env is not typed
			process.env.PORT = "3000";

			const schema = z.object({
				PORT: z.coerce.number(),
			});

			const getEnv = createEnvGetter(schema);
			expect(getEnv("PORT")).toBe(3000); // Note: This is now a number, not a string
		});

		it("should throw an error for invalid environment variables", () => {
			const schema = z.object({
				PORT: z.coerce.number(),
			});

			const getEnv = createEnvGetter(schema);
			expect(() => getEnv("PORT")).toThrow(
				"Invalid value for environment variable PORT",
			);
		});
	});

	describe("createEnvConfig", () => {
		it("should return an object with expected properties", () => {
			const schema = z.object({
				PORT: z.coerce.number(),
			});

			const envConfig = createEnvConfig(schema);

			expect(envConfig).toHaveProperty("createNestEnvValidator");
			expect(envConfig).toHaveProperty("config");
			expect(envConfig).toHaveProperty("schema");
			expect(envConfig).toHaveProperty("createEnvGetter");
		});
	});

	describe("presets", () => {
		it("should create a schema with common envs", () => {
			const schema = createPresetSchema(commonEnvs);

			expect(schema.shape).toHaveProperty("NODE_ENV");
			expect(schema.shape).toHaveProperty("PORT");
			expect(schema.shape).toHaveProperty("LOG_LEVEL");
		});

		it("should create a schema with database envs", () => {
			const schema = createPresetSchema(databaseEnvs);

			expect(schema.shape).toHaveProperty("DATABASE_URL");
			expect(schema.shape).toHaveProperty("DATABASE_SSL");
		});

		it("should create a schema with multiple presets", () => {
			const schema = createPresetSchema(commonEnvs, databaseEnvs);

			expect(schema.shape).toHaveProperty("NODE_ENV");
			expect(schema.shape).toHaveProperty("PORT");
			expect(schema.shape).toHaveProperty("LOG_LEVEL");
			expect(schema.shape).toHaveProperty("DATABASE_URL");
			expect(schema.shape).toHaveProperty("DATABASE_SSL");
		});
	});
});
