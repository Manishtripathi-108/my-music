import { z } from 'zod';

const stringArrayField = z
    .union([
        z
            .string()
            .trim()
            .min(1)
            .transform((s) => [s]),
        z.array(z.string().trim().min(1)),
    ])
    .nullable()
    .optional();

/**
 * Canonical AudioTags Schema.
 * Arrays are the sole canonical representation for multiple values (artists, genres).
 * Every field adheres to the explicit contract:
 * - undefined = unchanged (field omitted from modification)
 * - null      = clear (field purged from file metadata)
 * - value     = set (field updated to validated value)
 */
export const audioTagsSchema = z.object({
    title: z.string().trim().min(1).nullable().optional(),
    artists: stringArrayField,
    album: z.string().trim().nullable().optional(),
    albumArtist: z.string().trim().nullable().optional(),
    composer: z.string().trim().nullable().optional(),
    genres: stringArrayField,
    year: z.coerce.number().int().min(1000).max(3000).nullable().optional(),
    date: z
        .string()
        .trim()
        .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'Date must be YYYY, YYYY-MM, or YYYY-MM-DD')
        .nullable()
        .optional(),
    trackNumber: z.coerce.number().int().positive().nullable().optional(),
    trackTotal: z.coerce.number().int().positive().nullable().optional(),
    discNumber: z.coerce.number().int().positive().nullable().optional(),
    discTotal: z.coerce.number().int().positive().nullable().optional(),
    bpm: z.coerce.number().positive().nullable().optional(),
    isrc: z
        .string()
        .trim()
        .regex(/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/i, 'Invalid ISRC code')
        .nullable()
        .optional(),
    barcode: z.string().trim().nullable().optional(),
    catalogNumber: z.string().trim().nullable().optional(),
    label: z.string().trim().nullable().optional(),
    lyrics: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
    copyright: z.string().nullable().optional(),
    compilation: z.boolean().nullable().optional(),
    rating: z.coerce.number().min(0).max(100).nullable().optional(),
    replayGainTrackGain: z.coerce.number().nullable().optional(),
    replayGainTrackPeak: z.coerce.number().nullable().optional(),
    replayGainAlbumGain: z.coerce.number().nullable().optional(),
    replayGainAlbumPeak: z.coerce.number().nullable().optional(),
    customTags: z
        .record(z.string().min(1), z.union([z.string(), stringArrayField]))
        .nullable()
        .optional(),
});

export type AudioTags = z.infer<typeof audioTagsSchema>;

/**
 * Normalizes incoming tag keys from any casing (e.g. "Title", "Artist", "Genre")
 * into canonical camelCase property names before validation.
 */
function normalizeTagKeys(rawInput: unknown): unknown {
    if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
        return rawInput;
    }

    const output: Record<string, unknown> = {};
    const keyMap: Record<string, string> = {
        title: 'title',
        artist: 'artists',
        artists: 'artists',
        album: 'album',
        albumartist: 'albumArtist',
        composer: 'composer',
        genre: 'genres',
        genres: 'genres',
        year: 'year',
        date: 'date',
        tracknumber: 'trackNumber',
        tracktotal: 'trackTotal',
        discnumber: 'discNumber',
        disctotal: 'discTotal',
        bpm: 'bpm',
        isrc: 'isrc',
        barcode: 'barcode',
        catalognumber: 'catalogNumber',
        label: 'label',
        lyrics: 'lyrics',
        comment: 'comment',
        copyright: 'copyright',
        compilation: 'compilation',
        rating: 'rating',
        replaygaintrackgain: 'replayGainTrackGain',
        replaygaintrackpeak: 'replayGainTrackPeak',
        replaygainalbumgain: 'replayGainAlbumGain',
        replaygainalbumpeak: 'replayGainAlbumPeak',
        customtags: 'customTags',
    };

    for (const [key, value] of Object.entries(rawInput as Record<string, unknown>)) {
        const canonicalKey = keyMap[key.toLowerCase()] || key;
        output[canonicalKey] = value;
    }

    return output;
}

/**
 * Canonical writeable schema. Preprocesses input keys and ensures
 * at least one tag is explicitly set or cleared (not undefined).
 */
export const writeAudioTagsSchema = z
    .preprocess(normalizeTagKeys, audioTagsSchema)
    .refine((data) => Object.values(data).some((val) => val !== undefined), {
        message: 'At least one tag field must be provided to update or clear',
    });

export type WriteAudioTags = z.infer<typeof writeAudioTagsSchema>;
