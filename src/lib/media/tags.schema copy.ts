import { z } from 'zod';

import { TAG_FIELDS, customTagNameSchema, customTagValueSchema } from './tag-lib23';

type TagField = (typeof TAG_FIELDS)[number];

const tagShape = Object.fromEntries(TAG_FIELDS.map(({ field, schema }) => [field, schema])) as {
    [F in TagField as F['field']]: F['schema'];
};

export const AudioTagsSchema = z
    .strictObject({
        ...tagShape,
        customTags: z.record(customTagNameSchema, customTagValueSchema),
    })
    .partial();

export type AudioTags = z.infer<typeof AudioTagsSchema>;
