import { z } from 'zod';

import { conversionTargetFormatSchema, filePathSchema } from '@/lib/media';

export const convertMediaRequestSchema = z.object({
    inputPath: filePathSchema,
    outputPath: filePathSchema.optional(),
    targetFormat: conversionTargetFormatSchema,
    bitrate: z.string().optional(),
    sampleRate: z.coerce.number().optional(),
    bitDepth: z.union([z.literal(16), z.literal(24), z.literal(32)]).optional(),
    channels: z.union([z.literal(1), z.literal(2)]).optional(),
    downmixStereo: z.boolean().default(false),
    resampler: z.literal('soxr').default('soxr'),
    ditherMethod: z.enum(['triangular', 'lipshitz']).default('triangular'),
    applyNormalization: z.boolean().default(false),
});

export type ConvertMediaRequest = z.infer<typeof convertMediaRequestSchema>;
