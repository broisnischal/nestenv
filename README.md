# envnest

`envnest` is a TypeScript library for NestJS that provides type-safe environment variable validation and access using Zod schemas.

## Installation

```bash
npm install envnest
```

## Usage

### 1. Define your environment schema

Create a file to define your environment schema using Zod:

```typescript
// src/config/env.config.ts
import { createEnvConfig, z } from "envnest";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.string().transform(Number).default("3000"),
  DATABASE_URL: z.string().url(),
  TEST: z.string(),
});

export const envService = createEnvConfig(envSchema);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
```

### 2. Configure NestJS ConfigModule

In your `app.module.ts` file, set up the ConfigModule using the `envService`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envService } from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envService.validateConfig,
    }),
    // other imports...
  ],
  // ...
})
export class AppModule {}
```

### 3. Use the validated environment variables

You can now use the validated environment variables in your services:

```typescript
import { Injectable } from '@nestjs/common';
import { envService } from './config/env.config';

@Injectable()
export class AppService {
  getHello(): string {
    const url = envService.config.get("DATABASE_URL");
    return `testing ${url} ${process.env.PORT}`;
  }
}
```

## Presets

envnest comes with built-in presets for common environment variables. You can use these presets to quickly set up your environment schema.

### Using a preset

```typescript
import { createEnvConfig, presets } from "envnest";

const envSchema = presets.node().extend({
  DATABASE_URL: presets.databaseUrl(),
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

## Features

- Type-safe environment variable access
- Automatic validation of environment variables
- Default values support
- Global type augmentation for `process.env`
- Built-in presets for common configurations
- Custom preset support

## API Reference

- `createEnvConfig(schema: ZodSchema)`: Creates a configuration service with validation
- `envService.config`: Typed ConfigService instance
- `envService.validateConfig`: Validation function for use with NestJS ConfigModule
- `presets`: Object containing built-in presets

## License

[MIT](LICENSE)
