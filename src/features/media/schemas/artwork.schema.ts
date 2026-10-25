import { z } from 'zod';

import { filePathSchema } from '@/lib/media';

export const artworkExtractRequestSchema = z.object({
    path: filePathSchema,
    forceRefresh: z.boolean().default(false),
});

export const artworkQuerySchema = z
    .object({
        path: filePathSchema.optional(),
        file: z.string().trim().optional(),
    })
    .refine((data) => Boolean(data.path || data.file), {
        message: 'Either "path" (audio file path) or "file" (cached artwork filename) must be specified',
    });

export type ArtworkExtractRequest = z.infer<typeof artworkExtractRequestSchema>;
export type ArtworkQuery = z.infer<typeof artworkQuerySchema>;
