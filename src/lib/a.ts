/**
 * Normalizes a property key for case-insensitive, punctuation-insensitive comparison.
 *
 * @param key - Raw property key (e.g. "Album Artist", "ALBUM_ARTIST", "albumArtist").
 * @returns Cleaned lower-case alphanumeric key (e.g. "albumartist").
 */
export const compactKey = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, '');
