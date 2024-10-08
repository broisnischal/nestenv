# @nestenv/core

Typesafe environment variables for NestJS using Zod with preset schemas and
enhanced features.

## Installation

```bash
npm install @nestenv/core @nestjs/config zod
```

## Features

- Runtime validation of environment variables
- Type-safe access to environment variables through the `ConfigService`
- Automatic throwing of errors if required environment variables are missing or
  invalid
- Leverages Zod for powerful schema validation
- Preset schemas for common environment variables
- Customizable error handling and logging
- Direct environment variable getter with type safety

## Usage

### Basic Usage

1. Define your environment schema:

```typescript
// src/env.ts
import {
    createNestEnvValidator,
    createPresetSchema,
    createTypedConfigService,
    z,
} from "@nestenv/core";
import { commonEnvs, databaseEnvs } from "@nestenv/core/preset";

const envSchema = createPresetSchema(
    commonEnvs,
    databaseEnvs,
    {
        CUSTOM_VAR: z.string().min(1),
    },
);

export const validateEnv = createNestEnvValidator(envSchema);

export type Env = z.infer<typeof envSchema>;
export type TypedConfigService = ReturnType<
    typeof createTypedConfigService<typeof envSchema>
>;
```

2. Use the validator in your main module:

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./env";

@Module({
    imports: [
        ConfigModule.forRoot({
            validate: validateEnv,
            isGlobal: true,
        }),
        // Other modules...
    ],
})
export class AppModule {}
```

3. Inject and use the typed ConfigService in your services:

```typescript
// src/some.service.ts
import { Injectable } from "@nestjs/common";
import { TypedConfigService } from "./env";

@Injectable()
export class SomeService {
    constructor(private configService: TypedConfigService) {}

    someMethod() {
        const port = this.configService.get("PORT");
        const databaseUrl = this.configService.get("DATABASE_URL");
        // These will be correctly typed based on your schema
    }
}
```

### Advanced Usage

#### Custom Error Handling

```typescript
const validateEnv = createNestEnvValidator(envSchema, {
    logErrors: true,
    throwOnError: false,
});
```

#### Direct Environment Variable Getter

```typescript
import { createEnvGetter } from "@nestenv/core";

const getEnv = createEnvGetter(envSchema);

const port = getEnv("PORT"); // Typed and validated
```

## Real-world Use Case Scenarios

### Scenario 1: Microservice with Database and AWS Integration

```typescript
import { createNestEnvValidator, createPresetSchema, z } from "@nestenv/core";
import { awsEnvs, commonEnvs, databaseEnvs } from "@nestenv/core/preset";

const envSchema = createPresetSchema(
    commonEnvs,
    databaseEnvs,
    awsEnvs,
    {
        SERVICE_NAME: z.string().min(1),
        CACHE_TTL: z.coerce.number().positive(),
    },
);

export const validateEnv = createNestEnvValidator(envSchema);
```

### Scenario 2: Authentication Service

```typescript
import { createNestEnvValidator, createPresetSchema, z } from "@nestenv/core";
import { authEnvs, commonEnvs } from "@nestenv/core/preset";

const envSchema = createPresetSchema(
    commonEnvs,
    authEnvs,
    {
        OAUTH_CLIENT_ID: z.string().min(1),
        OAUTH_CLIENT_SECRET: z.string().min(1),
        ALLOWED_ORIGINS: z.string().transform((s) => s.split(",")),
    },
);

export const validateEnv = createNestEnvValidator(envSchema);
```

### Scenario 3: Logging and Monitoring Service

```typescript
import { createNestEnvValidator, createPresetSchema, z } from "@nestenv/core";
import { commonEnvs } from "@nestenv/core/preset";

const envSchema = createPresetSchema(
    commonEnvs,
    {
        ELASTICSEARCH_URL: z.string().url(),
        RETENTION_DAYS: z.coerce.number().positive(),
        ALERT_EMAIL: z.string().email(),
        METRICS_INTERVAL: z.coerce.number().positive(),
    },
);

export const validateEnv = createNestEnvValidator(envSchema);
```

## API Reference

### `createNestEnvValidator(schema: ZodType, options?: { logErrors?: boolean; throwOnError?: boolean })`

Creates a validator function for NestJS's `ConfigModule` based on a Zod schema.

### `createTypedConfigService(schema: ZodType)`

Creates a typed `ConfigService` based on your Zod schema.

### `createEnvGetter(schema: ZodType)`

Creates a function to safely get and validate individual environment variables.

### `createPresetSchema(...presets: ZodRawShape[])`

Creates a Zod schema by combining multiple preset schemas.

## License

MIT


<!-- ////  -->


## Presets

envnest comes with built-in presets for common environment variables. You can use these presets to quickly set up your environment schema.

### Using a preset

```typescript
import { createEnvConfig, presets } from "envnest";

const envSchema = presets.node().extend({
  ...presets.databaseUrl,
  // Add your custom environment variables here
});

export const envService = createEnvConfig(envSchema);
```

### Available presets

- `presets.node()`: Common Node.js environment variables (NODE_ENV, PORT)
- `presets.databaseUrl()`: Database URL validation
- `presets.jwt()`: JWT secret and expiration time
- `presets.cors()`: CORS configuration

## Custom Presets

You can create custom presets for your specific needs:

```typescript
import { z } from "envnest";

const myCustomPreset = () => z.object({
  CUSTOM_API_KEY: z.string().min(1),
  CUSTOM_API_URL: z.string().url(),
});

const envSchema = presets.node().extend({
  ...myCustomPreset().shape,
  // Other environment variables
});

export const envService = createEnvConfig(envSchema);
```