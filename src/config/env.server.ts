import 'server-only';
import { z } from 'zod';

/**
 * Validated server-only environment configuration.
 * Adheres to strict server/client boundary: never imported into client bundles.
 */
const serverEnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    ALLOWED_MEDIA_ROOTS: z
        .string()
        .min(1, 'ALLOWED_MEDIA_ROOTS cannot be empty')
        .transform((val) =>
            val
                .split(/[;,]/)
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
        )
        .refine((arr) => arr.length > 0, {
            message: 'At least one allowed media root must be configured in ALLOWED_MEDIA_ROOTS',
        }),
    FFMPEG_PATH: z.string().min(1).default('ffmpeg'),
    FFPROBE_PATH: z.string().min(1).default('ffprobe'),
    MEDIAINFO_PATH: z.string().min(1).default('MediaInfo'),
    TAGLIB_WORKER_PATH: z.string().trim().optional(),
    METADATA_ENGINE: z.enum(['native', 'wasm']).default('native'),
    PROBING_ENGINE: z.enum(['native', 'wasm']).default('native'),
    CONVERSION_ENGINE: z.enum(['native', 'wasm']).default('native'),
    ART_CACHE_DIR: z.string().min(1).default('cache/art'),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('[Config] Invalid server environment variables:', parsed.error.issues);
    throw new Error('Failed to validate server environment variables');
}

export const serverEnv = parsed.data;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const isProduction = serverEnv.NODE_ENV === 'production';
export const isDevelopment = serverEnv.NODE_ENV === 'development';
export const isTest = serverEnv.NODE_ENV === 'test';
