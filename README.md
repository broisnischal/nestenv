# envnest

#### This package is currently in development and not yet ready for production use.


Typesafe environment variables for NestJS using Zod with enhanced features.

## Installation

```bash
npm install envnest
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

## Basic Usage

### 1. Define your environment schema

Create a file `src/env.config.ts`:

```typescript
import { createEnvConfig, z } from "envnest";
import { commonEnvs, databaseEnvs } from "envnest/presets";

const { config, schema, validateEnv, getEnv } = createEnvConfig(
    z.object({
        ...commonEnvs,
        ...databaseEnvs,
        CUSTOM_VAR: z.string().min(1),
    }),
);

// Augment ProcessEnv
declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof schema> {}
    }
}

export { config, getEnv, validateEnv };
```

### 2. Use the validator in your main module

In your `src/app.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./env.config";

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

### 3. Use the typed config in your services

Create a service, e.g., `src/app.service.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { config, getEnv } from "./env.config";

@Injectable()
export class AppService {
    getDatabaseInfo() {
        // Using the config service
        const dbUrl = config.get("DATABASE_URL");
        const dbSsl = config.get("DATABASE_SSL");

        // Using the direct env getter
        const port = getEnv("PORT");

        return { dbUrl, dbSsl, port };
    }
}
```

## Advanced Usage

### Custom Error Handling

You can customize error handling when creating the env config:

```typescript
const { validateEnv } = createEnvConfig(
    schema,
    {
        logErrors: true,
        throwOnError: false,
    },
);
```

### Using Preset Schemas

```typescript
import { createEnvConfig, z } from "@nestenv/core";
import { awsEnvs, commonEnvs, databaseEnvs } from "@nestenv/core/presets";

const { config, schema, validateEnv } = createEnvConfig(
    z.object({
        ...commonEnvs,
        ...databaseEnvs,
        ...awsEnvs,
        CUSTOM_VAR: z.string().min(1),
    }),
);

export { config, validateEnv };
```

### Creating Custom Presets

You can create your own preset schemas:

```typescript
// src/custom-presets.ts
import { z } from "zod";

export const myAppEnvs = {
    APP_NAME: z.string().min(1),
    APP_VERSION: z.string().regex(/^\d+\.\d+\.\d+$/),
    FEATURE_FLAGS: z.string().transform((s) =>
        s.split(",").map((f) => f.trim())
    ),
};
```

Then use them in your env config:

```typescript
import { createEnvConfig, z } from "@nestenv/core";
import { commonEnvs } from "@nestenv/core/presets";
import { myAppEnvs } from "./custom-presets";

const { config, schema, validateEnv } = createEnvConfig(
    z.object({
        ...commonEnvs,
        ...myAppEnvs,
    }),
);

export { config, validateEnv };
```

## Real-world Use Case Scenarios

### Scenario 1: Microservice with Database and AWS Integration

```typescript
import { createEnvConfig, z } from "@nestenv/core";
import { awsEnvs, commonEnvs, databaseEnvs } from "@nestenv/core/presets";

const { config, validateEnv } = createEnvConfig(
    z.object({
        ...commonEnvs,
        ...databaseEnvs,
        ...awsEnvs,
        SERVICE_NAME: z.string().min(1),
        CACHE_TTL: z.coerce.number().positive(),
    }),
);

export { config, validateEnv };
```

### Scenario 2: Authentication Service

```typescript
import { createEnvConfig, z } from "@nestenv/core";
import { authEnvs, commonEnvs } from "@nestenv/core/presets";

const { config, validateEnv } = createEnvConfig(
    z.object({
        ...commonEnvs,
        ...authEnvs,
        OAUTH_CLIENT_ID: z.string().min(1),
        OAUTH_CLIENT_SECRET: z.string().min(1),
        ALLOWED_ORIGINS: z.string().transform((s) => s.split(",")),
    }),
);

export { config, validateEnv };
```

### Scenario 3: Logging and Monitoring Service

```typescript
import { createEnvConfig, z } from "@nestenv/core";
import { commonEnvs } from "@nestenv/core/presets";

const { config, validateEnv } = createEnvConfig(
    z.object({
        ...commonEnvs,
        ELASTICSEARCH_URL: z.string().url(),
        RETENTION_DAYS: z.coerce.number().positive(),
        ALERT_EMAIL: z.string().email(),
        METRICS_INTERVAL: z.coerce.number().positive(),
    }),
);

export { config, validateEnv };
```

## API Reference

### `createEnvConfig(schema: ZodType, options?: { logErrors?: boolean; throwOnError?: boolean })`

Creates a configuration object with the following properties:

- `config`: A typed ConfigService
- `schema`: The Zod schema used for validation
- `validateEnv`: A validator function for NestJS's ConfigModule
- `getEnv`: A type-safe environment variable getter

Options:

- `logErrors`: Whether to log validation errors (default: true)
- `throwOnError`: Whether to throw an error on validation failure (default:
  true)

### Preset Schemas

The following preset schemas are available in `@nestenv/core/presets`:

- `commonEnvs`: Common environment variables (NODE_ENV, PORT, LOG_LEVEL)
- `databaseEnvs`: Database-related environment variables (DATABASE_URL,
  DATABASE_SSL)
- `awsEnvs`: AWS-related environment variables (AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY, AWS_REGION)
- `authEnvs`: Authentication-related environment variables (JWT_SECRET,
  JWT_EXPIRATION)

## Best Practices

1. Keep your environment schema in a separate file (e.g., `env.config.ts`) for
   better organization.
2. Use preset schemas when possible to ensure consistency across different parts
   of your application.
3. Create custom presets for environment variables that are specific to your
   application or domain.
4. Always use the typed `config` or `getEnv` function to access environment
   variables in your application code.
5. Leverage Zod's transformation capabilities to parse and transform environment
   variables as needed (e.g., converting comma-separated strings to arrays).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
