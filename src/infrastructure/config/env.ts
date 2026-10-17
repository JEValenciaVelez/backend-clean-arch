import 'dotenv/config';

import { z } from 'zod';

const envVar = z.string().min(1);
const numberVar = z.coerce.number();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'sandbox', 'production', 'test']).default('development'),
    DEFAULT_LANG: envVar.default('es'),
    PORT: numberVar.default(8200),
    MULTI_CORE: numberVar.min(0).max(1).default(0),

    // Optional until a real database is connected.
    DATABASE_URL: envVar.optional(),

    // Auth
    JWT_SECRET: envVar.default('change-me-in-production'),
    JWT_EXPIRES_IN: envVar.default('7d'),

    // Logging
    API_TOKEN_PINO: envVar.optional(),
  })
  .superRefine((values, ctx) => {
    // A default secret in production means anyone can forge tokens: force the
    // deployer to provide a real one.
    if (values.NODE_ENV === 'production' && values.JWT_SECRET === 'change-me-in-production') {
      ctx.addIssue({
        code: 'custom',
        message: 'JWT_SECRET must be set to a strong, unique value in production',
        path: ['JWT_SECRET'],
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Error validating environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
