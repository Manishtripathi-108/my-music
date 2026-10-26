import { z } from 'zod';

import { filePathSchema, filePathsArraySchema } from '@/lib/media';
import { booleanSchema } from '@/lib/schema';

export const singleMetadataQuerySchema = z.object({
    path: filePathSchema,
    includeQC: booleanSchema.default(false),
    raw: booleanSchema.default(false),
});

export const batchMetadataRequestSchema = z.object({
    paths: filePathsArraySchema,
});

export type SingleMetadataQuery = z.infer<typeof singleMetadataQuerySchema>;
export type BatchMetadataRequest = z.infer<typeof batchMetadataRequestSchema>;
