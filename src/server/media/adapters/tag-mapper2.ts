// import 'server-only';
import { compactKey } from '@/lib/a';
import { convertDate } from '@/lib/format';
import {
    KNOWN_PROPERTY_KEYS,
    PARSE_FIELDS,
    SPECIAL_PROPERTY_KEYS,
    SYNTHETIC_PROPERTY_KEYS,
    TAG_FIELD_MAP,
    customTagNameSchema,
    getFieldKeys,
    isKnownProperty as isKnownTagLibProperty,
    parseFieldValue,
} from '@/lib/media/tag-lib23';
import { AudioTags, AudioTagsSchema } from '@/lib/media/tags.schema copy';

type TagLibRawMetadata = Record<string, string[]>;
type PropertyEntry = {
    originalKey: string;
    values: string[];
};
type MetadataIndex = Map<string, PropertyEntry[]>;

type ClassifiedTagIndex = {
    standard: MetadataIndex;
    special: MetadataIndex;
    customTags: MetadataIndex;
    ignoredSynthetic: MetadataIndex;
};

function normalizeMetadata(raw: unknown): TagLibRawMetadata {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new TypeError('Metadata must be a non-null object.');
    }

    const metadata: TagLibRawMetadata = {};

    for (const [key, value] of Object.entries(raw)) {
        if (value === null || value === undefined) continue;

        if (Array.isArray(value)) {
            const strings = value
                .filter((v): v is string | number | boolean => v !== null && v !== undefined)
                .map((v) => String(v).trim())
                .filter((v) => v.length > 0);
            if (strings.length > 0) {
                metadata[key] = strings;
            }
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            const str = String(value).trim();
            if (str.length > 0) {
                metadata[key] = [str];
            }
        }
    }

    return metadata;
}

function indexMetadata(properties: TagLibRawMetadata): MetadataIndex {
    const index: MetadataIndex = new Map();

    for (const [originalKey, values] of Object.entries(properties)) {
        const key = compactKey(originalKey);
        const entries = index.get(key) ?? [];
        entries.push({ originalKey, values });
        index.set(key, entries);
    }

    return index;
}

function classifyTagProperties(input: MetadataIndex): ClassifiedTagIndex {
    const result: ClassifiedTagIndex = {
        standard: new Map(),
        special: new Map(),
        customTags: new Map(),
        ignoredSynthetic: new Map(),
    };

    for (const [groupKey, properties] of input.entries()) {
        if (SYNTHETIC_PROPERTY_KEYS.has(groupKey)) {
            result.ignoredSynthetic.set(groupKey, [...(result.ignoredSynthetic.get(groupKey) || []), ...properties]);
        } else if (SPECIAL_PROPERTY_KEYS.has(groupKey)) {
            result.special.set(groupKey, [...(result.special.get(groupKey) || []), ...properties]);
        } else if (KNOWN_PROPERTY_KEYS.has(groupKey)) {
            result.standard.set(groupKey, [...(result.standard.get(groupKey) || []), ...properties]);
        } else {
            result.customTags.set(groupKey, [...(result.customTags.get(groupKey) || []), ...properties]);
        }
    }

    return result;
}

function readStandardProperties(index: MetadataIndex): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const { spec, keys } of PARSE_FIELDS) {
        if (spec.special) continue;

        let values: string[];

        if (spec.kind === 'list') {
            // For list fields, we want to collect all values from all matching keys, flatten them, and remove duplicates.
            values = [...new Set(keys.flatMap((key) => index.get(key) ?? []).flatMap((entry) => entry.values))];
        } else {
            let entry: PropertyEntry | undefined;

            // For non-list fields, we want to find the first matching key that has a non-empty value.
            // We prioritize keys based on the order in the `keys` array, which is determined by the field's specification in PARSE_FIELDS.
            // This ensures that canonical field names take precedence over aliases.
            for (const key of keys) {
                entry = index.get(key)?.find((item) => item.values.length > 0);

                if (entry) break;
            }

            values = entry?.values ?? [];
        }

        if (values.length === 0) continue;

        // Parse the values according to the field's kind and set the result if valid.
        const parsed = parseFieldValue(spec.kind, values);
        if (parsed !== undefined) {
            result[spec.field] = parsed;
        }
    }

    return result;
}

/* ----------------------- Special Property Helpers ------------------------ */

/** Finds the first non-empty raw value string from the index for any of the given compact keys. */
function firstRawValue(index: MetadataIndex, keys: string[]): string | undefined {
    for (const key of keys) {
        const entry = index.get(key)?.find((e) => e.values.length > 0);
        if (entry) return entry.values[0].trim();
    }
    return undefined;
}

/**
 * Splits a compound "number/total" string (e.g. "3/12", "1/9").
 * Returns `[number, total]` when both parts are valid positive integers,
 * `[number, undefined]` when only the number part is present.
 */
function splitCompoundNumber(value: string): [number | undefined, number | undefined] {
    const slashIdx = value.indexOf('/');

    if (slashIdx === -1) {
        const num = parseFieldValue('positiveInteger', [value]) as number | undefined;
        return [num, undefined];
    }

    const numPart = value.slice(0, slashIdx).trim();
    const totalPart = value.slice(slashIdx + 1).trim();

    return [
        parseFieldValue('positiveInteger', [numPart]) as number | undefined,
        parseFieldValue('positiveInteger', [totalPart]) as number | undefined,
    ];
}

/* ----------------------- Special Property Reader ------------------------- */

/**
 * Reads fields that require coordinated or compound parsing:
 *
 * 1. **Date / Year** — Coordinated date parsing. Date is formatted via `formatDate`.
 *    If year is not defined, it is derived from the parsed date. If both exist and differ,
 *    the explicit year is kept for `year` while `date` keeps its formatted value.
 *
 * 2. **Track / Disc compound numbers** — Values like `"3/12"` are split into
 *    `trackNumber` + `trackTotal` (or `discNumber` + `discTotal`). Explicit total
 *    keys take precedence over the embedded total.
 *
 * 3. **ReplayGain** — Parsed via `parseFieldValue` using registered kinds ('gain' / 'nonNegativeNumber').
 */
function readSpecialProperties(index: MetadataIndex): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const readKeys = new Set<string>();

    /* ---- Date / Year ---- */
    readDateAndYear(index, result, readKeys);

    /* ---- Track number / total ---- */
    readCompoundPair(index, result, 'trackNumber', 'trackTotal', readKeys);

    /* ---- Disc number / total ---- */
    readCompoundPair(index, result, 'discNumber', 'discTotal', readKeys);

    /* ---- Remaining special fields (e.g. ReplayGain) parsed automatically ---- */
    for (const [key, entries] of index) {
        if (readKeys.has(key)) continue;

        const spec = TAG_FIELD_MAP.get(key);
        if (!spec) continue;
        if (result[spec.field] !== undefined) continue;

        const entry = entries.find((e) => e.values.length > 0);
        if (!entry) continue;

        const parsed = parseFieldValue(spec.kind, entry.values);
        if (parsed !== undefined) {
            result[spec.field] = parsed;
            for (const k of getFieldKeys(spec.field)) {
                readKeys.add(k);
            }
        }
    }

    return result;
}

/**
 * Reconciles `year` and `date` using `convertDate` on both fields.
 *
 * - Parses `rawYear` and `rawDate` via `convertDate`.
 * - If year is not explicitly defined in the year field, derives it from the date field.
 * - If both are defined and differ, the explicit year is kept for `year` while `date` preserves its value.
 * - `date` is only set when full calendar information (month and day) is present.
 */
function readDateAndYear(index: MetadataIndex, result: Record<string, unknown>, readKeys: Set<string>): void {
    const dateKeys = getFieldKeys('date');
    const yearKeys = getFieldKeys('year');

    for (const key of dateKeys) readKeys.add(key);
    for (const key of yearKeys) readKeys.add(key);

    const rawDate = firstRawValue(index, dateKeys);
    const rawYear = firstRawValue(index, yearKeys);

    const yearParts = rawYear ? convertDate(rawYear) : null;
    const dateParts = rawDate ? convertDate(rawDate) : null;

    // Derive year: explicit year from year field wins; otherwise derive from date field
    const explicitYear = yearParts?.year;
    const derivedYear = dateParts?.year;
    const finalYear = explicitYear ?? derivedYear;

    // Date field is only populated when calendar month and day are present
    if (dateParts?.month && dateParts?.day && rawDate) {
        result.date = rawDate;
    } else if (yearParts?.month && yearParts?.day && rawYear) {
        result.date = rawYear;
    }

    if (finalYear !== undefined) {
        result.year = finalYear;
    }
}

/**
 * Reads a compound number/total pair (track or disc).
 *
 * Keys are retrieved dynamically from getFieldKeys. Values like `"3/12"`
 * are split, and explicit total keys take precedence over embedded totals.
 */
function readCompoundPair(
    index: MetadataIndex,
    result: Record<string, unknown>,
    numberField: string,
    totalField: string,
    readKeys: Set<string>,
): void {
    const numberKeys = getFieldKeys(numberField);
    const totalKeys = getFieldKeys(totalField);

    for (const key of numberKeys) readKeys.add(key);
    for (const key of totalKeys) readKeys.add(key);

    const rawNumber = firstRawValue(index, numberKeys);
    const rawTotal = firstRawValue(index, totalKeys);

    let number: number | undefined;
    let embeddedTotal: number | undefined;

    if (rawNumber) {
        [number, embeddedTotal] = splitCompoundNumber(rawNumber);
    }

    const explicitTotal = rawTotal ? (parseFieldValue('positiveInteger', [rawTotal]) as number | undefined) : undefined;

    const total = explicitTotal ?? embeddedTotal;

    if (number !== undefined) result[numberField] = number;
    if (total !== undefined) result[totalField] = total;
}

/* ----------------------- Custom Tag Reader ------------------------------- */

/**
 * Reads unrecognized properties as custom tags.
 *
 * Values are auto-typed: boolean strings become booleans, numeric strings become numbers,
 * comma-separated strings or multi-value entries become string arrays, and everything else
 * stays as a trimmed string. Validates tag names using customTagNameSchema.
 */
function readCustomTags(index: MetadataIndex): Record<string, unknown> {
    const customTags: Record<string, unknown> = {};

    for (const [, entries] of index) {
        for (const { originalKey, values } of entries) {
            if (values.length === 0) continue;

            const validKey = customTagNameSchema.safeParse(originalKey);
            if (!validKey.success) continue;

            customTags[validKey.data] = autoTypeValue(values);
        }
    }

    return customTags;
}

/** Coerces a single raw string to number, boolean, string array, or trimmed string. */
function autoTypeScalar(value: string): string | number | boolean | string[] {
    const trimmed = value.trim();

    // Comma-separated list detection (if multiple items are present)
    if (trimmed.includes(',')) {
        const parts = [
            ...new Set(
                trimmed
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean)
            ),
        ];
        if (parts.length > 1) {
            return parts;
        }
    }

    // Boolean detection (supports true/false, yes/no, on/off)
    const lower = trimmed.toLowerCase();
    if (lower === 'true' || lower === 'yes' || lower === 'on') return true;
    if (lower === 'false' || lower === 'no' || lower === 'off') return false;

    // Numeric detection using single source of truth parser
    const num = parseFieldValue('number', [trimmed]);
    if (typeof num === 'number') return num;

    return trimmed;
}

/**
 * Coerces custom tag values:
 * - Unwraps single-child arrays into a scalar (number, boolean, string) or splits if it contains commas.
 * - Multi-child arrays are flattened (splitting any comma-containing elements) and trimmed.
 */
function autoTypeValue(values: string[] | string): string | number | boolean | string[] {
    if (Array.isArray(values)) {
        if (values.length === 0) return '';
        if (values.length === 1) {
            return autoTypeScalar(values[0]);
        }

        // Multi-child array: split any elements containing commas and trim
        return [
            ...new Set(
                values
                    .flatMap((v) => (v.includes(',') ? v.split(',') : [v]))
                    .map((s) => s.trim())
                    .filter(Boolean)
            ),
        ];
    }

    return autoTypeScalar(values);
}

/* ----------------------------- Entry Point ------------------------------- */

function fromTagLibProperties(rawProperties: Record<string, unknown>): AudioTags {
    const normalized = normalizeMetadata(rawProperties);
    const index = indexMetadata(normalized);
    const classified = classifyTagProperties(index);

    const standardProps = readStandardProperties(classified.standard);
    const specialProps = readSpecialProperties(classified.special);
    const customTags = readCustomTags(classified.customTags);

    const merged: Record<string, unknown> = {
        ...specialProps,
        ...standardProps,
    };

    // Only attach customTags when there are entries to avoid an empty object in the schema.
    if (Object.keys(customTags).length > 0) {
        merged.customTags = customTags;
    }

    const audioTags = AudioTagsSchema.safeParse(merged);
    if (!audioTags.success) {
        console.error('Failed to parse AudioTags:', audioTags.error);
        return {} as AudioTags;
    }

    console.log('🪵 > tag-mapper2.ts:404 > fromTagLibProperties > data:', audioTags.data)
    return audioTags.data;
}

// function toTagLibProperties(tags: AudioTags): Record<string, unknown> {}

// function toFlatPropertyMap(tags: AudioTags): Record<string, unknown> {}

/**
 * Universal TagMapper facade providing bi-directional transformation between
 * TagLib property maps and the strongly-typed AudioTags / WriteAudioTags domain models.
 */
export const TagMapper = {
    fromTagLibProperties,
    // toTagLibProperties,
    // toFlatPropertyMap,
    isKnownTagLibProperty,
};

// this for testing only
const raw = {
    ALBUM: 'Led Zeppelin IV',
    albumArtist: ['Led Zeppelin'],
    COMMENT: ['This is a comment.'],
    RATING: ['5'],
    ISRC: ['USAT29900609'],
    UPC: ['602547199006'],
    BPM: ['82'],
    COMPOSER: ['Jimmy Page', 'Robert Plant'],
    DISCNUMBER: ['1/2'],
    TITLE: '  Whole Lotta Love  ',
    'Album Artist': ['Led Zeppelin'],
    ALBUM_ARTIST: ['Led Zeppelin & Guests'],
    TRACKNUMBER: ['1/9'],
    'Track Total': ['9'],
    YEAR: '1969/10/5',
    COMPILATION: true,
    GENRE: ['Hard Rock', null, '   ', 'Blues Rock'],
    EMPTY_TAG: '',
    NULL_FIELD: null,
    EMPTY_LIST: ['   ', null],
    artist: 'Led Zeppelin,Robert Plant,Jimmy Page,John Paul Jones',
    replayGainTrackGain: '-7.2 dB',
    replayGainTrackPeak: '0.987654',
    replayGainAlbumGain: '-6.5 dB',
    replayGainAlbumPeak: '0.999999',
    customField: 'This field is synthetic and should be ignored.',
    extraField: 'This field is not recognized and should be treated as a custom tag.',
};
TagMapper.fromTagLibProperties(raw);
