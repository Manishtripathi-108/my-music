import 'server-only';

import type { AudioTags, WriteAudioTags } from '@/lib/media';
import { parseFloatNumber, parseInteger } from '@/lib/number';

export type TagLibPropertyValue = string[];
export type TagLibPropertyMap = Record<string, TagLibPropertyValue>;

/** Supported input value types for writing to TagLib property maps. */
export type TagWriteValue = string | number | boolean | string[] | null;

/**
 * Maps the application's canonical audio metadata model
 * to and from TagLib's format-independent property model.
 *
 * Pure mapping layer containing zero I/O, subprocesses, or TagLib calls.
 *
 * Write semantics:
 * - undefined: leave property unchanged (omitted from TagLibPropertyMap)
 * - null: remove property (represented as empty array [] for TagLibClient removal)
 * - value: replace property (string array)
 */
export class TagMapper {
    private static readonly WRITE_MAP = {
        title: 'TITLE',
        artists: 'ARTIST',
        album: 'ALBUM',
        albumArtist: 'ALBUMARTIST',
        composer: 'COMPOSER',
        genres: 'GENRE',
        date: 'DATE',
        year: 'YEAR',
        trackNumber: 'TRACKNUMBER',
        trackTotal: 'TRACKTOTAL',
        discNumber: 'DISCNUMBER',
        discTotal: 'DISCTOTAL',
        bpm: 'BPM',
        isrc: 'ISRC',
        barcode: 'BARCODE',
        catalogNumber: 'CATALOGNUMBER',
        label: 'LABEL',
        lyrics: 'LYRICS',
        comment: 'COMMENT',
        copyright: 'COPYRIGHT',
        rating: 'RATING',
        replayGainTrackGain: 'REPLAYGAIN_TRACK_GAIN',
        replayGainTrackPeak: 'REPLAYGAIN_TRACK_PEAK',
        replayGainAlbumGain: 'REPLAYGAIN_ALBUM_GAIN',
        replayGainAlbumPeak: 'REPLAYGAIN_ALBUM_PEAK',
    } as const;

    /**
     * Converts canonical write metadata into TagLib properties.
     */
    public static toTagLibProperties(tags: WriteAudioTags): TagLibPropertyMap {
        const properties: TagLibPropertyMap = {};

        for (const [field, property] of Object.entries(this.WRITE_MAP)) {
            // Safe index: field is guaranteed to be a key of WRITE_MAP.
            const value = tags[field as keyof typeof this.WRITE_MAP];
            this.setProperty(properties, property, value);
        }

        if (tags.compilation !== undefined) {
            this.setProperty(properties, 'COMPILATION', tags.compilation === null ? null : tags.compilation ? '1' : '0');
        }

        if (tags.customTags) {
            for (const [key, value] of Object.entries(tags.customTags)) {
                this.setProperty(properties, key, value);
            }
        }

        return properties;
    }

    /**
     * Converts TagLib properties into canonical application metadata.
     */
    public static fromTagLibProperties(properties: Record<string, unknown>): AudioTags {
        const normalized = this.normalizeProperties(properties);

        const track = this.parseCompoundNumber(normalized.TRACKNUMBER);
        const disc = this.parseCompoundNumber(normalized.DISCNUMBER);

        const trackNumber = track.value ?? this.parseIntegerValue(normalized.TRACK);
        const discNumber = disc.value ?? this.parseIntegerValue(normalized.DISC);

        const trackTotal = this.parseIntegerValue(normalized.TRACKTOTAL) ?? track.total;
        const discTotal = this.parseIntegerValue(normalized.DISCTOTAL) ?? disc.total;

        return {
            title: this.first(normalized.TITLE),
            artists: this.values(normalized.ARTIST),
            album: this.first(normalized.ALBUM),
            albumArtist: this.first(normalized.ALBUMARTIST) ?? this.first(normalized['ALBUM ARTIST']),
            composer: this.first(normalized.COMPOSER),
            genres: this.values(normalized.GENRE),
            date: this.first(normalized.DATE),
            year: this.parseIntegerValue(normalized.YEAR) ?? this.parseIntegerValue(normalized.DATE),
            trackNumber,
            trackTotal,
            discNumber,
            discTotal,
            bpm: this.parseFloatValue(normalized.BPM),
            isrc: this.first(normalized.ISRC),
            barcode: this.first(normalized.BARCODE),
            catalogNumber: this.first(normalized.CATALOGNUMBER),
            label: this.first(normalized.LABEL) ?? this.first(normalized.ORGANIZATION),
            lyrics: this.first(normalized.LYRICS) ?? this.first(normalized.UNSYNCEDLYRICS),
            comment: this.first(normalized.COMMENT),
            copyright: this.first(normalized.COPYRIGHT),
            compilation: this.parseBoolean(normalized.COMPILATION),
            rating: this.parseIntegerValue(normalized.RATING),
            replayGainTrackGain: this.parseFloatValue(normalized.REPLAYGAIN_TRACK_GAIN),
            replayGainTrackPeak: this.parseFloatValue(normalized.REPLAYGAIN_TRACK_PEAK),
            replayGainAlbumGain: this.parseFloatValue(normalized.REPLAYGAIN_ALBUM_GAIN),
            replayGainAlbumPeak: this.parseFloatValue(normalized.REPLAYGAIN_ALBUM_PEAK),
            customTags: Object.fromEntries(
                Object.entries(normalized)
                    .filter(([key]) => !Object.values(this.WRITE_MAP).some((property) => property === key))
                    .map(([key, values]) => [key, this.m1(values)] as const)
            ),
        };
    }

    private static m1(value: string[] | undefined | null): string | string[] | undefined | null {
        if (value === undefined || value === null) {
            return value;
        }

        if (value.length === 0) {
            return undefined;
        }

        if (value.length === 1) {
            return value[0];
        }

        return value;
    }

    /**
     * Sets one TagLib property using the application's write semantics.
     *
     * - null is represented as an empty list [] (signaling removal to TagLibClient).
     * - string[] maps to an array of strings.
     * - scalar values map to a single-element string array.
     */
    private static setProperty(properties: TagLibPropertyMap, key: string, value: TagWriteValue | undefined): void {
        if (value === undefined) {
            return;
        }

        const normalizedKey = this.normalizeKey(key);

        if (value === null) {
            properties[normalizedKey] = [];
            return;
        }

        if (Array.isArray(value)) {
            properties[normalizedKey] = value.map(String);
            return;
        }

        properties[normalizedKey] = [String(value)];
    }

    /**
     * Normalizes raw TagLib properties once in a single pass.
     */
    private static normalizeProperties(properties: Record<string, unknown>): Record<string, string[]> {
        const normalized: Record<string, string[]> = {};

        for (const [key, value] of Object.entries(properties)) {
            const values = this.toStringArray(value);
            if (values.length === 0) {
                continue;
            }

            normalized[this.normalizeKey(key)] = values;
        }

        return normalized;
    }

    /**
     * Normalizes a TagLib property name to uppercase trimmed format.
     */
    private static normalizeKey(key: string): string {
        return key.trim().toUpperCase();
    }

    /**
     * Converts a raw property value into a cleaned array of non-empty strings.
     */
    private static toStringArray(value: unknown): string[] {
        if (value === undefined || value === null) {
            return [];
        }

        const values = Array.isArray(value) ? value : [value];

        return values.map((v) => this.toStringValue(v).trim()).filter((v) => v.length > 0);
    }

    /**
     * Converts a single raw value into a string without producing '[object Object]'.
     */
    private static toStringValue(value: unknown): string {
        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }

        if (typeof value === 'object' && value !== null && 'text' in value) {
            const textVal = (value as { text: unknown }).text;
            if (typeof textVal === 'string') {
                return textVal;
            }
            if (typeof textVal === 'number' || typeof textVal === 'boolean') {
                return String(textVal);
            }
        }

        // Unsupported object types are ignored rather than producing '[object Object]'
        return '';
    }

    /**
     * Returns the first property value from an array.
     */
    private static first(values: string[] | undefined): string | undefined {
        return values?.[0];
    }

    /**
     * Returns all property values if non-empty, otherwise undefined.
     */
    private static values(values: string[] | undefined): string[] | undefined {
        return values?.length ? values : undefined;
    }

    /**
     * Parses an integer property using centralized numeric parsing.
     */
    private static parseIntegerValue(values: string[] | undefined): number | undefined {
        return parseInteger(this.first(values));
    }

    /**
     * Parses a floating point property using centralized numeric parsing.
     */
    private static parseFloatValue(values: string[] | undefined): number | undefined {
        return parseFloatNumber(this.first(values));
    }

    /**
     * Parses boolean metadata with strict optional semantics.
     * Returns true for '1', 'true', 'yes'.
     * Returns false for '0', 'false', 'no'.
     * Returns undefined for missing or unparseable values.
     */
    private static parseBoolean(values: string[] | undefined): boolean | undefined {
        const value = this.first(values)?.trim().toLowerCase();
        if (value === undefined) {
            return undefined;
        }

        if (value === '1' || value === 'true' || value === 'yes') {
            return true;
        }

        if (value === '0' || value === 'false' || value === 'no') {
            return false;
        }

        return undefined;
    }

    /**
     * Parses compound values such as '3/12' into { value, total }.
     */
    private static parseCompoundNumber(values: string[] | undefined): {
        value?: number;
        total?: number;
    } {
        const raw = this.first(values);
        if (!raw) {
            return {};
        }

        const separator = raw.indexOf('/');
        if (separator === -1) {
            return {
                value: parseInteger(raw),
            };
        }

        return {
            value: parseInteger(raw.slice(0, separator)),
            total: parseInteger(raw.slice(separator + 1)),
        };
    }
}
