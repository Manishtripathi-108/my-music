import { z } from 'zod';

import { filePathSchema } from '@/lib/media';
import { booleanSchema } from '@/lib/schema';

export const technicalQuerySchema = z.object({
    path: filePathSchema,
    includeQC: booleanSchema.default(false),
});

export type TechnicalQuery = z.infer<typeof technicalQuerySchema>;
