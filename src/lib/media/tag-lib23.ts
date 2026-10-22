import { z } from 'zod';

import { compactKey } from '../a';
import {
    booleanSchema,
    dateSchema,
    listSchema,
    nonNegativeNumberSchema,
    numberSchema,
    positiveIntegerSchema,
    positiveNumberSchema,
    textSchema,
} from '../schema';

const ISRC_PATTERN = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/;
const UPC_PATTERN = /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/;
const RESERVED_TAG_NAMES = new Set(['proto', 'prototype', 'constructor']);

/** Determines value parsing, validation constraints, and TagLib serialization rules. */
export type ValueKind = 'text' | 'freeText' | 'list' | 'positiveInteger' | 'positiveNumber' | 'number' | 'nonNegativeNumber' | 'gain';

/** Declaration of a typed audio tag field within the registry. */
export type TagSpec = {
    /** Domain model field name (e.g. 'title', 'artists') */
    field: string;
    /** Canonical TagLib property key (e.g. 'TITLE', 'ARTIST') */
    property: string;
    /** Alternative property keys accepted on read and cleared on canonical writes */
    aliases?: readonly string[];
    /** Part of a coordinated group (year/date, track/disc) that needs custom read/write handling */
    special?: boolean;
    /** Determines parsing, validation, and serialization behavior */
    kind: ValueKind;
    /** Validation and transformation schema */
    schema: z.ZodType;
};

/* ------------------------- Shared field fragments ------------------------- */
// `as const` keeps literal kinds and specific schema types so AudioTags infers precisely.

const TEXT = { kind: 'text', schema: textSchema } as const;
const FREE_TEXT = { kind: 'freeText', schema: textSchema } as const;
const LIST = { kind: 'list', schema: listSchema } as const;
const GAIN = { kind: 'gain', schema: numberSchema } as const;
const PEAK = { kind: 'nonNegativeNumber', schema: nonNegativeNumberSchema } as const;
/** Track/disc numbers and totals can be encoded together (e.g. "3/12"). */
const COUNTER = { kind: 'positiveInteger', schema: positiveIntegerSchema, special: true } as const;

/* ----------------------------- Field Registry ----------------------------- */

/**
 * Single source of truth for all typed audio metadata fields.
 * Adding an entry here propagates typing, Zod schemas, alias mapping, and TagLib I/O.
 */
export const TAG_FIELDS = [
    // Core metadata
    { field: 'title', property: 'TITLE', ...TEXT },
    { field: 'artists', property: 'ARTIST', aliases: ['ARTISTS', 'ARTISTNAME'], ...LIST },
    { field: 'album', property: 'ALBUM', ...TEXT },
    { field: 'albumArtists', property: 'ALBUMARTIST', aliases: ['ALBUM ARTIST', 'ALBUMARTISTS'], ...LIST },
    { field: 'composers', property: 'COMPOSER', ...LIST },
    { field: 'genres', property: 'GENRE', aliases: ['GENRES', 'GENRE'], ...LIST },

    // Date & year
    { field: 'year', property: 'YEAR', special: true, kind: 'positiveInteger', schema: positiveIntegerSchema },
    { field: 'date', property: 'DATE', special: true, kind: 'text', schema: dateSchema },

    // Track & disc
    { field: 'trackNumber', property: 'TRACKNUMBER', aliases: ['TRACK'], ...COUNTER },
    { field: 'trackTotal', property: 'TRACKTOTAL', aliases: ['TOTALTRACKS', 'TRACKCOUNT'], ...COUNTER },
    { field: 'discNumber', property: 'DISCNUMBER', aliases: ['DISKNUMBER', 'DISC', 'DISK'], ...COUNTER },
    {
        field: 'discTotal',
        property: 'DISCTOTAL',
        aliases: ['TOTALDISCS', 'TOTALDISKS', 'DISCCOUNT', 'DISKCOUNT', 'DISKTOTAL'],
        ...COUNTER,
    },

    // Identifiers
    { field: 'bpm', property: 'BPM', aliases: ['TEMPO'], kind: 'positiveNumber', schema: positiveNumberSchema },
    {
        field: 'isrc',
        property: 'ISRC',
        kind: 'text',
        schema: textSchema.toUpperCase().regex(ISRC_PATTERN, 'Invalid ISRC format'),
    },
    {
        field: 'upc',
        property: 'UPC',
        aliases: ['UPCA', 'UPCE', 'GTIN'],
        kind: 'text',
        schema: textSchema.regex(UPC_PATTERN, 'Invalid UPC format'),
    },
    { field: 'barcode', property: 'BARCODE', ...TEXT },
    { field: 'catalogNumber', property: 'CATALOGNUMBER', aliases: ['CATALOG NUMBER', 'CATALOGNO'], ...TEXT },
    { field: 'label', property: 'LABEL', aliases: ['PUBLISHER', 'ORGANIZATION', 'RECORDLABEL'], ...TEXT },

    // Text content
    { field: 'lyrics', property: 'LYRICS', aliases: ['UNSYNCEDLYRICS'], ...FREE_TEXT },
    { field: 'comment', property: 'COMMENT', aliases: ['DESCRIPTION'], ...FREE_TEXT },
    { field: 'copyright', property: 'COPYRIGHT', ...FREE_TEXT },

    // Flags & ratings
    { field: 'compilation', property: 'COMPILATION', kind: 'text', schema: booleanSchema },
    { field: 'rating', property: 'RATING', kind: 'nonNegativeNumber', schema: nonNegativeNumberSchema },

    // ReplayGain
    {
        field: 'replayGainTrackGain',
        property: 'REPLAYGAIN_TRACK_GAIN',
        ...GAIN,
        special: true,
    },
    {
        field: 'replayGainTrackPeak',
        property: 'REPLAYGAIN_TRACK_PEAK',
        ...PEAK,
        special: true,
    },
    {
        field: 'replayGainAlbumGain',
        property: 'REPLAYGAIN_ALBUM_GAIN',
        ...GAIN,
        special: true,
    },
    {
        field: 'replayGainAlbumPeak',
        property: 'REPLAYGAIN_ALBUM_PEAK',
        ...PEAK,
        special: true,
    },
] as const satisfies readonly TagSpec[];

/** Widened view of the registry for generic iteration (optional props like `aliases` are accessible). */
const SPECS: readonly TagSpec[] = TAG_FIELDS;

/** O(1) lookup: field name, canonical property, or alias → definition */
export const TAG_FIELD_MAP = new Map<string, TagSpec>(
    SPECS.flatMap((spec) => {
        const entries: [string, TagSpec][] = [
            [compactKey(spec.field), spec],
            [compactKey(spec.property), spec],
        ];
        if (spec.aliases) {
            for (const alias of spec.aliases) {
                entries.push([compactKey(alias), spec]);
            }
        }
        return entries;
    })
);

/**
 * Returns all compact keys for a field (canonical property, aliases, and field name)
 * in priority order.
 */
export function getFieldKeys(field: string): string[] {
    const spec = TAG_FIELD_MAP.get(compactKey(field));
    if (!spec) return [compactKey(field)];

    return [
        ...new Set([spec.property, ...(spec.aliases ?? []), spec.field].map(compactKey)),
    ];
}

/** Specs for fields that need coordinated read/write handling. */
export const SPECIAL_PROPERTY_KEYS = new Set(
    SPECS.filter((spec) => spec.special)
        .flatMap((spec) => [spec.field, spec.property, ...(spec.aliases ?? [])])
        .map(compactKey)
);

/** Fields that need to be parsed from the metadata. */
export const PARSE_FIELDS = SPECS.map((spec) => ({
    spec,
    keys: getFieldKeys(spec.field),
}));

/* ---------------------------- Property Lookup ----------------------------- */

/**
 * Stream and container properties excluded from customTags to prevent pollution.
 * ENCODEDBY and ENCODING are intentionally omitted as they are user-facing tags.
 * Keys are stored in compact form (see `compactKey`).
 */
export const SYNTHETIC_PROPERTY_KEYS = new Set([
    // Duration & size
    'duration',
    'durationms',
    'durationseconds',
    'filesize',
    'filesizebytes',
    'samplecount',

    // Audio stream
    'bitrate',
    'overallbitrate',
    'samplerate',
    'samplingrate',
    'channels',
    'channelcount',
    'channellayout',
    'bitdepth',
    'bitspersample',
    'sampleformat',
    'islossless',

    // Codec & container
    'codec',
    'codecname',
    'codectag',
    'codecprofile',
    'codecdelay',
    'codecpadding',
    'container',
    'containerformat',
    'format',
    'streamcount',
    'streams',
    'streamindex',

    // Encoder
    'encoderdelay',
    'encoderpadding',
    'encodersignature',
    'encodersignatures',
    'ffmpegencoder',
    'ffprobeencoder',
]);

/** Compact keys for every field name, canonical property, and alias in the registry. */
export const KNOWN_PROPERTY_KEYS = new Set(SPECS.flatMap((spec) => [spec.field, spec.property, ...(spec.aliases ?? [])]).map(compactKey));

/**
 * Determines whether a property key belongs to the typed model or synthetic stream metadata.
 *
 * @param key - Raw property key to test.
 */
export function isKnownProperty(key: string): boolean {
    const compact = compactKey(key);
    return KNOWN_PROPERTY_KEYS.has(compact) || SYNTHETIC_PROPERTY_KEYS.has(compact);
}

/* ------------------------------ Custom Tags ------------------------------- */

export const customTagNameSchema = textSchema
    .min(1)
    .max(255)
    .regex(/^[\x20-\x3C\x3E-\x7E]+$/, 'Tag names must be printable ASCII and must not contain "="')
    .refine((key) => !RESERVED_TAG_NAMES.has(compactKey(key)), 'This tag name is reserved');

export const customTagValueSchema = z.union([z.boolean(), numberSchema, listSchema, textSchema]);

const DECIMAL_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
const INTEGER_PATTERN = /^\d+$/;

function parseFiniteNumber(value: string): number | undefined {
    const normalized = value.trim();

    if (!DECIMAL_PATTERN.test(normalized)) {
        return undefined;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseFieldValue(kind: ValueKind, value: string[]): unknown | undefined {
    switch (kind) {
        case 'text':
        case 'freeText':
            return value.length > 0 ? value[0].trim() : value[0];

        case 'positiveInteger': {
            if (!INTEGER_PATTERN.test(value[0].trim())) {
                return undefined;
            }

            const parsed = Number(value[0].trim());

            return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
        }

        case 'positiveNumber': {
            const parsed = parseFiniteNumber(value[0].trim());
            return parsed !== undefined && parsed > 0 ? parsed : undefined;
        }

        case 'nonNegativeNumber': {
            const parsed = parseFiniteNumber(value[0].trim());
            return parsed !== undefined && parsed >= 0 ? parsed : undefined;
        }

        case 'number':
            return parseFiniteNumber(value[0].trim());

        case 'gain': {
            const numericValue = value[0]
                .trim()
                .replace(/\s*dB$/i, '')
                .trim();

            return parseFiniteNumber(numericValue);
        }

        case 'list':
            return [
                ...new Set(
                    value
                        .flatMap((item) => (item.includes(',') ? item.split(',') : [item]))
                        .map((item) => item.trim())
                        .filter(Boolean)
                ),
            ];

        default: {
            const exhaustive: never = kind;
            return exhaustive;
        }
    }
}
