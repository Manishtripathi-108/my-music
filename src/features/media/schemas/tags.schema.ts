import { z } from 'zod';

import { filePathSchema, writeAudioTagsSchema } from '@/lib/media';

export const tagsQuerySchema = z.object({
    path: filePathSchema,
});

export const writeTagsRequestSchema = z.object({
    path: filePathSchema,
    tags: writeAudioTagsSchema,
    preserveOriginal: z.boolean().default(false),
});

export const batchWriteTagsRequestSchema = z.object({
    targets: z
        .array(
            z.object({
                path: filePathSchema,
                tags: writeAudioTagsSchema,
            })
        )
        .min(1, 'At least one write target is required')
        .max(500, 'Batch write limit cannot exceed 500 files'),
    preserveOriginal: z.boolean().default(false),
});

export type TagsQuery = z.infer<typeof tagsQuerySchema>;
export type WriteTagsRequest = z.infer<typeof writeTagsRequestSchema>;
export type BatchWriteTagsRequest = z.infer<typeof batchWriteTagsRequestSchema>;
