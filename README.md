# [envnest](https://www.npmjs.com/package/envnest)

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

## License

This project is licensed under the [MIT](LICENSE) License. See the [LICENSE](LICENSE) file for more details. 
