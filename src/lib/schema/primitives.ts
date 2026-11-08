import { z } from 'zod';

import { convertDate } from '../format';
import { parseBoolean } from '../number';

export const textSchema = z.string().trim();
export const listSchema = z.array(textSchema);

export const numberSchema = z.coerce.number();
export const positiveNumberSchema = numberSchema.positive();
export const nonNegativeNumberSchema = numberSchema.nonnegative();
export const positiveIntegerSchema = numberSchema.int().positive();

export const booleanSchema = z.preprocess((value) => {
    const parsed = parseBoolean(value);
    return parsed !== undefined ? parsed : value;
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
