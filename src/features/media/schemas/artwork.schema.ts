import { z } from 'zod';

export const artworkExtractRequestSchema = z.object({
    path: z
        .string()
        .trim()
        .min(1, 'Audio file path is required')
        .transform((val) => val.replace(/\\+/g, '/')),
    forceRefresh: z.boolean().default(false),
});

export const artworkQuerySchema = z
    .object({
        path: z
            .string()
            .trim()
            .optional()
            .transform((val) => (val ? val.replace(/\\+/g, '/') : undefined)),
        file: z.string().trim().optional(),
    })
    .refine((data) => Boolean(data.path || data.file), {
        message: 'Either "path" (audio file path) or "file" (cached artwork filename) must be specified',
    });

export type ArtworkExtractRequest = z.infer<typeof artworkExtractRequestSchema>;
export type ArtworkQuery = z.infer<typeof artworkQuerySchema>;
