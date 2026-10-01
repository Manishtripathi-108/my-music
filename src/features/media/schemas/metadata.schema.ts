import { z } from 'zod';

export const singleMetadataQuerySchema = z.object({
    path: z
        .string()
        .trim()
        .min(1, 'Audio file path is required')
        .transform((val) => val.replace(/\\+/g, '/')),
});

export const batchMetadataRequestSchema = z.object({
    paths: z
        .array(
            z
                .string()
                .trim()
                .min(1, 'File path cannot be empty')
                .transform((val) => val.replace(/\\+/g, '/'))
        )
        .min(1, 'At least one file path is required')
        .max(500, 'Batch size cannot exceed 500 files'),
});

export type SingleMetadataQuery = z.infer<typeof singleMetadataQuerySchema>;
export type BatchMetadataRequest = z.infer<typeof batchMetadataRequestSchema>;
