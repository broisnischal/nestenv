

# @nestenv/core

Typesafe environment variables for NestJS using Zod.

## Installation

```bash
npm install nestenv
```

## Usage

1. Define your environment schema:

```typescript
// src/config/env.ts
import { createNestEnvValidator, createTypedConfigService, z } from "nestenv";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.string().transform(Number).pipe(z.number().positive()),
    DATABASE_URL: z.string().url(),
    // Add other environment variables as needed
});

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
    // ...
})
export class AppModule {}
```

3. Inject and use the typed ConfigService in your services:

```typescript
// src/some.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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

## Features

- Runtime validation of environment variables
- Type-safe access to environment variables through the `ConfigService`
- Automatic throwing of errors if required environment variables are missing or
  invalid
- Leverages Zod for powerful schema validation

## API

### `createNestEnvValidator(schema: ZodType)`

Creates a validator function for NestJS's `ConfigModule` based on a Zod schema.

### `createTypedConfigService(schema: ZodType)`

Creates a typed `ConfigService` based on your Zod schema.

## License

MIT
