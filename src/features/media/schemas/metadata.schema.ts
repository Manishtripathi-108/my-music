import { z } from 'zod';

import { filePathSchema, filePathsArraySchema } from '@/lib/media';

export const singleMetadataQuerySchema = z.object({
    path: filePathSchema,
    includeQC: z.union([z.boolean(), z.string().transform((v) => v === 'true' || v === '1')]).default(false),
    raw: z.union([z.boolean(), z.string().transform((v) => v === 'true' || v === '1')]).default(false),
});

export const batchMetadataRequestSchema = z.object({
    paths: filePathsArraySchema,
});

export type SingleMetadataQuery = z.infer<typeof singleMetadataQuerySchema>;
export type BatchMetadataRequest = z.infer<typeof batchMetadataRequestSchema>;
