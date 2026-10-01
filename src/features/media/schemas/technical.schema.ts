import { z } from 'zod';

export const technicalQuerySchema = z.object({
    path: z
        .string()
        .trim()
        .min(1, 'Audio file path is required')
        .transform((val) => val.replace(/\\+/g, '/')),
});

export type TechnicalQuery = z.infer<typeof technicalQuerySchema>;
