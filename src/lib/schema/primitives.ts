import { z } from 'zod';

import { convertDate } from '../format';

export const textSchema = z.string().trim();
export const listSchema = z.array(textSchema);

export const numberSchema = z.coerce.number();
export const positiveNumberSchema = numberSchema.positive();
export const nonNegativeNumberSchema = numberSchema.nonnegative();
export const positiveIntegerSchema = numberSchema.int().positive();

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off']);

export const booleanSchema = z.preprocess((value) => {
    if (typeof value === 'boolean') return value;
    if (value === 1) return true;
    if (value === 0) return false;

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();

        if (TRUE_VALUES.has(normalized)) return true;
        if (FALSE_VALUES.has(normalized)) return false;
    }

    return value;
}, z.boolean());

export const dateSchema = z.union([z.string(), z.number(), z.date()]).transform((value, ctx) => {
    const date = convertDate(value);

    if (!date) {
        ctx.addIssue({
            code: 'custom',
            message: `Invalid date format: ${String(value)}`,
        });

        return z.NEVER;
    }

    return [String(date.day).padStart(2, '0'), String(date.month).padStart(2, '0'), date.year].join('/');
});
