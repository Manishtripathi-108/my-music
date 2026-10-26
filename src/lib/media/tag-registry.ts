import { z } from 'zod';

import { splitDelimitedList } from '../format';
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

/**
 * Normalizes a property key for case-insensitive, punctuation-insensitive comparison.
 */
export const compactKey = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, '');

/* -------------------------- Value Kinds & Parsing ------------------------- */

/** Determines value parsing, validation constraints, and TagLib serialization rules. */
export type ValueKind = 'text' | 'freeText' | 'list' | 'positiveInteger' | 'positiveNumber' | 'number' | 'nonNegativeNumber' | 'gain';

const DECIMAL_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
const INTEGER_PATTERN = /^\d+$/;

function parseFiniteNumber(value: string): number | undefined {
    const normalized = value.trim();
    if (!DECIMAL_PATTERN.test(normalized)) return undefined;

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseFieldValue(kind: ValueKind, value: string[]): unknown | undefined {
    if (value.length === 0) return kind === 'list' ? [] : undefined;

    switch (kind) {
        case 'text':
            return value[0].trim();

        case 'freeText':
            return value.map((v) => v.trim()).filter(Boolean).join('\n');

        case 'positiveInteger': {
            const trimmed = value[0].trim();
            if (!INTEGER_PATTERN.test(trimmed)) return undefined;

            const parsed = Number(trimmed);
            return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
        }

        case 'positiveNumber': {
            const parsed = parseFiniteNumber(value[0]);
            return parsed !== undefined && parsed > 0 ? parsed : undefined;
        }

        case 'nonNegativeNumber': {
            const parsed = parseFiniteNumber(value[0]);
            return parsed !== undefined && parsed >= 0 ? parsed : undefined;
        }

        case 'number':
            return parseFiniteNumber(value[0]);

        case 'gain': {
            const numericValue = value[0].trim().replace(/\s*dB$/i, '');
            return parseFiniteNumber(numericValue);
        }

        case 'list':
            return splitDelimitedList(value);

        default: {
            const exhaustive: never = kind;
            return exhaustive;
        }
    }
}

/* ------------------------ Field Registry & Fragments ---------------------- */

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

const TEXT = { kind: 'text', schema: textSchema } as const;
const FREE_TEXT = { kind: 'freeText', schema: textSchema } as const;
const LIST = { kind: 'list', schema: listSchema } as const;
const GAIN = { kind: 'gain', schema: numberSchema } as const;
const PEAK = { kind: 'nonNegativeNumber', schema: nonNegativeNumberSchema } as const;
/** Track/disc numbers and totals can be encoded together (e.g. "3/12"). */
const COUNTER = { kind: 'positiveInteger', schema: positiveIntegerSchema, special: true } as const;

const ISRC_PATTERN = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/;
const UPC_PATTERN = /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/;

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

    // Date & year (coordinated read handling)
    { field: 'year', property: 'YEAR', special: true, kind: 'positiveInteger', schema: positiveIntegerSchema },
    { field: 'date', property: 'DATE', special: true, kind: 'text', schema: dateSchema },

    // Track & disc (compound read handling)
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

    // ReplayGain (parsed automatically by kind)
    { field: 'replayGainTrackGain', property: 'REPLAYGAIN_TRACK_GAIN', ...GAIN },
    { field: 'replayGainTrackPeak', property: 'REPLAYGAIN_TRACK_PEAK', ...PEAK },
    { field: 'replayGainAlbumGain', property: 'REPLAYGAIN_ALBUM_GAIN', ...GAIN },
    { field: 'replayGainAlbumPeak', property: 'REPLAYGAIN_ALBUM_PEAK', ...PEAK },
] as const satisfies readonly TagSpec[];

/* ---------------------------- Key & Field Lookups ------------------------- */

/** O(1) lookup: field name, canonical property, or alias → definition */
export const TAG_FIELD_MAP = new Map<string, TagSpec>(
    TAG_FIELDS.flatMap((spec) => {
        const entries: [string, TagSpec][] = [
            [compactKey(spec.field), spec],
            [compactKey(spec.property), spec],
        ];
        if ('aliases' in spec && spec.aliases) {
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

    return [...new Set([spec.property, ...(spec.aliases ?? []), spec.field].map(compactKey))];
}

/* ------------------------- Synthetic & Known Properties ------------------- */

/**
 * Stream and container properties excluded from customTags to prevent pollution.
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

/**
 * Determines whether a property key belongs to the typed model or synthetic stream metadata.
 */
export function isKnownTagLibProperty(key: string): boolean {
    const compact = compactKey(key);
    return TAG_FIELD_MAP.has(compact) || SYNTHETIC_PROPERTY_KEYS.has(compact);
}
