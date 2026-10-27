import 'server-only';

import { convertDate, splitDelimitedList } from '@/lib/format';
import { compactKey, getFieldKeys, isKnownTagLibProperty, parseFieldValue, TAG_FIELDS } from '@/lib/media/tag-registry';
import { type AudioTags, audioTagsSchema, customTagNameSchema, writeAudioTagsSchema } from '@/lib/media/tags.schema';

/* --------------------------------- Types ---------------------------------- */

type PropertyEntry = {
    originalKey: string;
    values: string[];
};

type MetadataIndex = Map<string, PropertyEntry[]>;

/* --------------------------- Indexing & Lookups --------------------------- */
/** Finds the first non-empty value string for any matching compact key in priority order. */
function firstRawValue(index: MetadataIndex, keys: string[]): string | undefined {
    for (const key of keys) {
        const entries = index.get(key);
        if (entries) return entries[0].values[0];
    }
    return undefined;
}

/**
 * Normalizes raw property values and builds an index grouped by compact keys in a single pass.
 */
function indexMetadata(raw: unknown): MetadataIndex {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new TypeError('Metadata must be a non-null object.');
    }

    const index: MetadataIndex = new Map();

    for (const [originalKey, value] of Object.entries(raw)) {
        if (value === null || value === undefined) continue;

        let values: string[];
        if (Array.isArray(value)) {
            values = value
                .filter((v): v is string | number | boolean => v !== null && v !== undefined)
                .map((v) => String(v).trim())
                .filter((v) => v.length > 0);
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            const str = String(value).trim();
            values = str.length > 0 ? [str] : [];
        } else {
            continue;
        }

        if (values.length === 0) continue;

        const key = compactKey(originalKey);
        const entries = index.get(key);
        if (entries) {
            entries.push({ originalKey, values });
        } else {
            index.set(key, [{ originalKey, values }]);
        }
    }

    return index;
}

/* --------------------------- Standard Properties -------------------------- */

/** Reads all standard, non-special properties directly from the index using TAG_FIELDS. */
function readStandardProperties(index: MetadataIndex): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const spec of TAG_FIELDS) {
        if ('special' in spec && spec.special) continue;

        const keys = getFieldKeys(spec.field);

        if (spec.kind === 'list') {
            const values = [...new Set(keys.flatMap((key) => index.get(key) ?? []).flatMap((entry) => entry.values))];
            if (values.length === 0) continue;

            const parsed = parseFieldValue(spec.kind, values);
            if (parsed !== undefined) result[spec.field] = parsed;
        } else {
            const raw = firstRawValue(index, keys);
            if (!raw) continue;

            const parsed = parseFieldValue(spec.kind, [raw]);
            if (parsed !== undefined) result[spec.field] = parsed;
        }
    }

    return result;
}

/* ---------------------------- Special Properties -------------------------- */

/** Splits compound "number/total" strings (e.g. "3/12"). */
function splitCompoundNumber(value: string): [number | undefined, number | undefined] {
    const slashIdx = value.indexOf('/');
    if (slashIdx === -1) {
        return [parseFieldValue('positiveInteger', [value]) as number | undefined, undefined];
    }
    return [
        parseFieldValue('positiveInteger', [value.slice(0, slashIdx)]) as number | undefined,
        parseFieldValue('positiveInteger', [value.slice(slashIdx + 1)]) as number | undefined,
    ];
}

/** Reads compound number/total pairs (track or disc). */
function readCompoundPair(index: MetadataIndex, result: Record<string, unknown>, numberField: string, totalField: string): void {
    const rawNumber = firstRawValue(index, getFieldKeys(numberField));
    const rawTotal = firstRawValue(index, getFieldKeys(totalField));

    const [num, embeddedTotal] = rawNumber ? splitCompoundNumber(rawNumber) : [undefined, undefined];
    const explicitTotal = rawTotal ? (parseFieldValue('positiveInteger', [rawTotal]) as number | undefined) : undefined;
    const total = explicitTotal ?? embeddedTotal;

    if (num !== undefined) result[numberField] = num;
    if (total !== undefined) result[totalField] = total;
}

/** Reconciles year and date, deriving missing values and preserving explicit ones. */
function readDateAndYear(index: MetadataIndex, result: Record<string, unknown>): void {
    const rawDate = firstRawValue(index, getFieldKeys('date'));
    const rawYear = firstRawValue(index, getFieldKeys('year'));

    const yearParts = rawYear ? convertDate(rawYear) : null;
    const dateParts = rawDate ? convertDate(rawDate) : null;

    const finalYear = yearParts?.year ?? dateParts?.year;

    if (dateParts?.month && dateParts?.day && rawDate) {
        result.date = rawDate;
    } else if (yearParts?.month && yearParts?.day && rawYear) {
        result.date = rawYear;
    }

    if (finalYear !== undefined) {
        result.year = finalYear;
    }
}

/** Reads special coordinated properties (Date/Year and Track/Disc). */
function readSpecialProperties(index: MetadataIndex): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    readDateAndYear(index, result);
    readCompoundPair(index, result, 'trackNumber', 'trackTotal');
    readCompoundPair(index, result, 'discNumber', 'discTotal');

    return result;
}

/* ------------------------------ Custom Tags ------------------------------- */

/** Coerces custom tag values to boolean, number, list, or trimmed string. */
function autoTypeValue(values: string[]): string | number | boolean | string[] {
    if (values.length === 1) {
        const val = values[0].trim();

        if (val.includes(',')) {
            const parts = splitDelimitedList(val);
            if (parts.length > 1) return parts;
        }

        const lower = val.toLowerCase();
        if (lower === 'true' || lower === 'yes' || lower === 'on') return true;
        if (lower === 'false' || lower === 'no' || lower === 'off') return false;

        const num = parseFieldValue('number', [val]);
        if (typeof num === 'number') return num;

        return val;
    }

    return splitDelimitedList(values);
}

/** Reads unrecognized properties as custom tags, skipping known and synthetic keys. */
function readCustomTags(index: MetadataIndex): Record<string, unknown> {
    const customTags: Record<string, unknown> = {};

    for (const [key, entries] of index) {
        if (isKnownTagLibProperty(key)) continue;

        for (const { originalKey, values } of entries) {
            const validKey = customTagNameSchema.safeParse(originalKey);
            if (!validKey.success) continue;

            customTags[validKey.data] = autoTypeValue(values);
        }
    }

    return customTags;
}

/* ------------------------------- Public API ------------------------------- */

/** Parses raw TagLib properties into strongly-typed AudioTags. */
function fromTagLibProperties(rawProperties: unknown): AudioTags {
    const index = indexMetadata(rawProperties);

    const merged: Record<string, unknown> = {
        ...readStandardProperties(index),
        ...readSpecialProperties(index),
    };

    const customTags = readCustomTags(index);
    if (Object.keys(customTags).length > 0) {
        merged.customTags = customTags;
    }

    return audioTagsSchema.parse(merged);
}

function toTagLibProperties(input: unknown): Record<string, string[]> {
    const patch = writeAudioTagsSchema.parse(input);

    const result: Record<string, string[]> = {};

    for (const spec of TAG_FIELDS) {
        const value = patch[spec.field];
        if (value === undefined) continue;

        if ('aliases' in spec && spec.aliases) {
            for (const alias of spec.aliases) {
                result[alias] = [];
            }
        }

        if (value === null) {
            result[spec.property] = [];
            continue;
        }

        const rawItems = spec.kind === 'list' && Array.isArray(value) ? value.map(String) : String(value);
        result[spec.property] = splitDelimitedList(rawItems);
    }

    const uniqueCustomTagKeys = new Set<string>();

    for (const [key, value] of Object.entries(patch.customTags ?? {})) {
        if (value === undefined || isKnownTagLibProperty(key) || uniqueCustomTagKeys.has(compactKey(key))) continue;

        if (value === null) {
            result[key] = [];
            continue;
        }

        uniqueCustomTagKeys.add(compactKey(key));
        result[key] = Array.isArray(value) ? value.map(String) : [String(value)];
    }

    return result;
}

export const TagMapper = {
    fromTagLibProperties,
    toTagLibProperties,
};
