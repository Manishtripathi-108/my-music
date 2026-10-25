import { z } from 'zod';

import { filePathSchema } from '@/lib/media';

export const technicalQuerySchema = z.object({
    path: filePathSchema,
    includeQC: z.union([z.boolean(), z.string().transform((val) => val === 'true' || val === '1')]).default(false),
});

export type TechnicalQuery = z.infer<typeof technicalQuerySchema>;
