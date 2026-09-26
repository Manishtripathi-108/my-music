import { z } from 'zod';

export const scanModeEnum = z.enum(['addNew', 'forceAll', 'rescanErrors']);

export const scanRequestSchema = z.object({
    directory: z
        .string()
        .trim()
        .min(1, 'Directory path cannot be empty')
        .transform((val) => val.replace(/\\+/g, '/').replace(/\/+$/, '')),
    scanMode: scanModeEnum.default('addNew'),
    recursive: z
        .union([z.boolean(), z.literal(''), z.literal('true'), z.literal('false'), z.literal('on')])
        .default(true)
        .transform((val) => {
            if (val === '' || val === 'false' || val === false) return false;
            return Boolean(val);
        }),
});

export type ScanMode = z.infer<typeof scanModeEnum>;

export type ScanRequestInput = z.input<typeof scanRequestSchema>;
export type ScanRequest = z.output<typeof scanRequestSchema>;
