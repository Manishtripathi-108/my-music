import { z } from 'zod';

/**
 * Validated client environment configuration.
 * Exposes only NEXT_PUBLIC_* variables safe for browser bundles.
 */
const clientEnvSchema = z.object({
    NEXT_PUBLIC_APP_NAME: z.string().default('My Music'),
    NEXT_PUBLIC_APP_URL: z.url().optional(),
});

export const clientEnv = clientEnvSchema.parse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
