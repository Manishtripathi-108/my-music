import { z } from 'zod';

import { listSchema, numberSchema, textSchema } from '../schema';
import { compactKey, isKnownTagLibProperty, TAG_FIELDS } from './tag-registry';

type TagField = (typeof TAG_FIELDS)[number];

const tagShape = Object.fromEntries(TAG_FIELDS.map(({ field, schema }) => [field, schema])) as {
    [F in TagField as F['field']]: F['schema'];
};

const nullableTagShape = Object.fromEntries(TAG_FIELDS.map(({ field, schema }) => [field, schema.nullable()])) as {
    [F in TagField as F['field']]: z.ZodNullable<F['schema']>;
};

const RESERVED_TAG_NAMES = new Set(['proto', 'prototype', 'constructor']);

export const customTagNameSchema = textSchema
    .min(1, 'Tag names must contain at least 1 characters')
    .max(255, 'Tag names must not exceed 255 characters')
    .regex(/^[A-Za-z][\x20-\x3C\x3E-\x7E]*$/, 'Tag names must start with a letter, contain printable ASCII characters, and must not contain "="')
    .refine((key) => !RESERVED_TAG_NAMES.has(compactKey(key)), 'This tag name is reserved');

export const customTagValueSchema = z.union([z.boolean(), numberSchema, listSchema, textSchema]);

export const audioTagsSchema = z
    .strictObject({
        ...tagShape,
        customTags: z.record(customTagNameSchema, customTagValueSchema),
    })
    .partial();

export type AudioTags = z.infer<typeof audioTagsSchema>;

export const writeAudioTagsSchema = z
    .strictObject({
        ...nullableTagShape,
        customTags: z
            .record(customTagNameSchema, customTagValueSchema)
            .superRefine((tags, ctx) => {
                const seen = new Map<string, string>();

                for (const key of Object.keys(tags)) {
                    // Known audio properties are handled by the standard fields.
                    if (isKnownTagLibProperty(key)) continue;

                    const normalizedKey = compactKey(key);
                    const existingKey = seen.get(normalizedKey);

                    if (existingKey !== undefined) {
                        ctx.addIssue({
                            code: 'custom',
                            path: [key],
                            message: `Duplicate custom tag name "${key}" conflicts with "${existingKey}".`,
                        });

                        continue;
                    }

                    seen.set(normalizedKey, key);
                }
            })
            .nullable(),
    })
    .partial();

export type WriteAudioTags = z.infer<typeof writeAudioTagsSchema>;
