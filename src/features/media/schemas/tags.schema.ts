import { z } from 'zod';

export const tagsQuerySchema = z.object({
    path: z
        .string()
        .trim()
        .min(1, 'Audio file path is required')
        .transform((val) => val.replace(/\\+/g, '/')),
});

export const writeTagsRequestSchema = z.object({
    path: z
        .string()
        .trim()
        .min(1, 'Audio file path is required')
        .transform((val) => val.replace(/\\+/g, '/')),
    tags: z
        .record(z.string().min(1, 'Tag name cannot be empty'), z.union([z.string(), z.number(), z.array(z.string()), z.null()]))
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one tag key-value pair must be specified',
        }),
    preserveOriginal: z.boolean().default(false),
});

export const batchWriteTagsRequestSchema = z.object({
    targets: z
        .array(
            z.object({
                path: z
                    .string()
                    .trim()
                    .min(1, 'Target file path is required')
                    .transform((val) => val.replace(/\\+/g, '/')),
                tags: z
                    .record(z.string().min(1, 'Tag name cannot be empty'), z.union([z.string(), z.number(), z.array(z.string()), z.null()]))
                    .refine((data) => Object.keys(data).length > 0, {
                        message: 'Target must have at least one tag to write',
                    }),
            })
        )
        .min(1, 'At least one write target is required')
        .max(500, 'Batch write limit cannot exceed 500 files'),
    preserveOriginal: z.boolean().default(false),
});

export type TagsQuery = z.infer<typeof tagsQuerySchema>;
export type WriteTagsRequest = z.infer<typeof writeTagsRequestSchema>;
export type BatchWriteTagsRequest = z.infer<typeof batchWriteTagsRequestSchema>;
