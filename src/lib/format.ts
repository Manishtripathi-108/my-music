/**
 * Generic Isomorphic Formatting & Parsing Utilities.
 * Client-safe and server-safe (zero Node dependencies).
 */

/* ------------------------ Audio & Media Formatting ------------------------ */

/**
 * Formats a raw byte count into a human-readable string (e.g. "4.2 MB").
 *
 * @param bytes - Size in bytes.
 * @param decimals - Decimal places to round to. Defaults to 1.
 * @returns Formatted file size string.
 */
export function formatBytes(bytes: number, decimals = 1): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

    const k = 1024;
    const dm = Math.max(0, decimals);
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
    const value = bytes / Math.pow(k, i);

    return `${parseFloat(value.toFixed(dm))} ${units[i]}`;
}

/**
 * Formats a duration in seconds into a standard time display string:
 * - "03:45" (minutes:seconds)
 * - "01:23:45" (hours:minutes:seconds)
 *
 * @param seconds - Total duration in seconds.
 * @returns Formatted time string.
 */
export function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';

    const totalSecs = Math.floor(seconds);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const remainingSecs = totalSecs % 60;

    const pad = (num: number) => String(num).padStart(2, '0');

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSecs)}`;
    }

    return `${pad(minutes)}:${pad(remainingSecs)}`;
}

/**
 * Formats a total duration in seconds into a human-readable string for summaries.
 * Picks the two most significant units for a compact display.
 *
 * @param seconds - Total duration in seconds.
 * @returns Human-readable duration string.
 * @example
 * formatDurationHuman(90);    // "1 min 30 sec"
 * formatDurationHuman(3661);  // "1 hr 1 min"
 * formatDurationHuman(86400); // "1 day"
 */
export function formatDurationHuman(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0 sec';

    const totalSecs = Math.floor(seconds);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hr${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} min`);
    if (secs > 0 && days === 0) parts.push(`${secs} sec`);

    // Show at most two segments for compactness.
    return parts.slice(0, 2).join(' ') || '0 sec';
}

/**
 * Formats an audio bitrate in bits per second (bps) into a readable rate (e.g. "320 kbps", "1.4 Mbps").
 *
 * @param bitrateBps - Bitrate in bits per second.
 * @returns Formatted bitrate string.
 */
export function formatBitrate(bitrateBps: number): string {
    if (!Number.isFinite(bitrateBps) || bitrateBps <= 0) return '0 kbps';

    if (bitrateBps >= 1_000_000) {
        return `${(bitrateBps / 1_000_000).toFixed(1)} Mbps`;
    }

    return `${Math.round(bitrateBps / 1000)} kbps`;
}

/**
 * Formats an audio sample rate in Hz into a readable string (e.g. "44.1 kHz", "96 kHz").
 *
 * @param hz - Sample rate in Hz.
 * @returns Formatted sample rate string.
 * @example
 * formatSampleRate(44100);  // "44.1 kHz"
 * formatSampleRate(48000);  // "48 kHz"
 * formatSampleRate(192000); // "192 kHz"
 */
export function formatSampleRate(hz: number): string {
    if (!Number.isFinite(hz) || hz <= 0) return '0 Hz';

    if (hz >= 1000) {
        const khz = hz / 1000;
        // Drop the decimal when it's a whole number (48, 96) for cleaner display.
        return `${khz % 1 === 0 ? khz : parseFloat(khz.toFixed(1))} kHz`;
    }

    return `${Math.round(hz)} Hz`;
}

/* ------------------------- Date & Time Formatting ------------------------- */

/**
 * Formats an ISO timestamp or date into a localized time string.
 * Safe against invalid date strings.
 *
 * @param date - Date object, ISO string, or timestamp.
 * @returns Localized time string or empty string on invalid date.
 * @example
 * formatTime('2024-06-01T14:30:00Z'); // "02:30:00 PM" (depending on locale)
 * formatTime(1714765800000); // "02:30:00 PM" (depending on locale)
 */
export function formatTime(date: string | number | Date): string {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return '';

    return parsed.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

/**
 * Formats a date into a localized display string.
 * Safe against invalid date values.
 *
 * @param date - Date object, ISO string, or timestamp.
 * @param style - Display style: 'short' (6/1/24), 'medium' (Jun 1, 2024), 'long' (June 1, 2024). Defaults to 'medium'.
 * @returns Formatted date string or empty string on invalid date.
 * @example
 * formatDate('2024-06-01');           // "Jun 1, 2024"
 * formatDate('2024-06-01', 'short');  // "6/1/24"
 * formatDate('2024-06-01', 'long');   // "June 1, 2024"
 */
export function formatDate(date: string | number | Date, style: 'short' | 'medium' | 'long' = 'medium'): string {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return '';

    const options: Intl.DateTimeFormatOptions = { timeZone: 'UTC' };

    switch (style) {
        case 'short':
            options.year = '2-digit';
            options.month = 'numeric';
            options.day = 'numeric';
            break;
        case 'medium':
            options.year = 'numeric';
            options.month = 'short';
            options.day = 'numeric';
            break;
        case 'long':
            options.year = 'numeric';
            options.month = 'long';
            options.day = 'numeric';
            break;
    }

    return parsed.toLocaleDateString(undefined, options);
}

/**
 * Returns a human-readable relative time string (e.g. "3 minutes ago", "in 2 hours").
 * Falls back to a locale date string for dates more than 30 days away.
 *
 * @param date - Date object, ISO string, or timestamp to compare against now.
 * @param now - Reference time. Defaults to `Date.now()`.
 * @returns Relative time string or empty string on invalid date.
 * @example
 * formatRelativeTime(Date.now() - 30_000);    // "30 seconds ago"
 * formatRelativeTime(Date.now() - 7200_000);  // "2 hours ago"
 * formatRelativeTime(Date.now() + 86400_000); // "in 1 day"
 */
export function formatRelativeTime(date: string | number | Date, now = Date.now()): string {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return '';

    const diffMs = parsed.getTime() - now;
    const absDiffSec = Math.abs(Math.round(diffMs / 1000));

    const thresholds: [number, Intl.RelativeTimeFormatUnit, number][] = [
        [60, 'second', 1],
        [3600, 'minute', 60],
        [86400, 'hour', 3600],
        [2592000, 'day', 86400], // 30 days
    ];

    for (const [limit, unit, divisor] of thresholds) {
        if (absDiffSec < limit) {
            const value = Math.round(diffMs / 1000 / divisor);
            return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(value, unit);
        }
    }

    // Beyond 30 days, fall back to an absolute locale date.
    return formatDate(parsed, 'medium');
}

/* ----------------------------- Text Utilities ----------------------------- */

/**
 * Truncates text to a maximum length at word boundaries.
 * Appends an ellipsis when truncated. Never breaks mid-word.
 *
 * @param text - Input text.
 * @param maxLength - Maximum character length (including the ellipsis). Defaults to 80.
 * @param ellipsis - Truncation indicator. Defaults to '…'.
 * @returns Truncated text.
 * @example
 * truncateText('The quick brown fox jumps over the lazy dog', 20); // "The quick brown fox…"
 */
export function truncateText(text: string, maxLength = 80, ellipsis = '…'): string {
    if (text.length <= maxLength) return text;

    // Find the last space within the allowed budget.
    const budget = maxLength - ellipsis.length;
    if (budget <= 0) return ellipsis.slice(0, maxLength);

    const lastSpace = text.lastIndexOf(' ', budget);
    const breakpoint = lastSpace > 0 ? lastSpace : budget;

    return text.slice(0, breakpoint).trimEnd() + ellipsis;
}

/**
 * Returns a count-qualified label with correct singular/plural form.
 *
 * @param count - Numeric quantity.
 * @param singular - Singular form of the word.
 * @param plural - Optional explicit plural. Defaults to `singular + 's'`.
 * @returns Formatted string with count and correctly inflected noun.
 * @example
 * pluralize(1, 'track');  // "1 track"
 * pluralize(5, 'track');  // "5 tracks"
 * pluralize(0, 'library', 'libraries'); // "0 libraries"
 */
export function pluralize(count: number, singular: string, plural?: string): string {
    const noun = Math.abs(count) === 1 ? singular : (plural ?? `${singular}s`);
    return `${count} ${noun}`;
}

/* ------------------------------ Date Parsing ------------------------------ */

/**
 * Calendar date parts extracted from a date input.
 */
export type DateParts = {
    year: number;
    month?: number;
    day?: number;
};

/**
 * Short and full month name lookup, case-insensitive.
 */
const MONTH_NAMES: Record<string, number> = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
};

/**
 * Validates that the given year/month/day triplet represents a real calendar date.
 * Uses `Date.UTC` round-trip to catch impossible dates like Feb 30.
 */
function isValidDate(year: number, month: number, day: number): boolean {
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * Parses a text month name (e.g. "Jun", "September") into a 1-based month number.
 * Returns `undefined` for unrecognized names.
 */
function parseMonthName(name: string): number | undefined {
    return MONTH_NAMES[name.toLowerCase()];
}

/**
 * Robust date parser that extracts year/month/day parts from a wide range of formats.
 * Never throws — returns `null` for unparseable or invalid dates.
 *
 * Supported inputs:
 * - `Date` objects and numeric timestamps
 * - ISO 8601: `2024-06-01`, `2024-06-01T14:30:00Z`, `2024-06-01T14:30:00+05:30`
 * - Year-only: `2024`
 * - Year-month: `2024-06`, `2024/06`
 * - Year-first: `2024-06-01`, `2024/06/01`, `2024.06.01`
 * - Day-first: `01-06-2024`, `01/06/2024`, `01.06.2024`
 * - Text month: `June 1, 2024`, `1 June 2024`, `Jun 2024`, `01-Jun-2024`
 * - Compact: `20240601` (8 digits)
 *
 * Month and day fields are omitted when the input doesn't contain them.
 *
 * @param value - Date value in any common format.
 * @returns Extracted date parts, or `null` if the value is invalid.
 * @example
 * convertDate('2024-06-01');             // { year: 2024, month: 6, day: 1 }
 * convertDate('June 1, 2024');           // { year: 2024, month: 6, day: 1 }
 * convertDate('2024');                   // { year: 2024 }
 * convertDate('2024-06');                // { year: 2024, month: 6 }
 * convertDate('2024-06-01T14:30:00Z');   // { year: 2024, month: 6, day: 1 }
 * convertDate(new Date(2024, 5, 1));     // { year: 2024, month: 6, day: 1 }
 * convertDate('not-a-date');             // null
 */
export function convertDate(value: string | Date | number): DateParts | null {
    // Date objects and numeric timestamps
    if (value instanceof Date || typeof value === 'number') {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;

        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
        };
    }

    const input = value.trim();
    if (input.length === 0) return null;

    // Year only: "2024"
    if (/^\d{4}$/.test(input)) {
        const year = Number(input);
        return year >= 1 && year <= 9999 ? { year } : null;
    }

    // Year-month: "2024-06" or "2024/06"
    const yearMonthMatch = input.match(/^(\d{4})[-/](\d{1,2})$/);
    if (yearMonthMatch) {
        const year = Number(yearMonthMatch[1]);
        const month = Number(yearMonthMatch[2]);
        return month >= 1 && month <= 12 ? { year, month } : null;
    }

    // ISO 8601 with time component: strip time portion and parse the date part
    const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})[T ]/);
    if (isoMatch) {
        const year = Number(isoMatch[1]);
        const month = Number(isoMatch[2]);
        const day = Number(isoMatch[3]);
        return month >= 1 && month <= 12 && isValidDate(year, month, day) ? { year, month, day } : null;
    }

    // Compact 8-digit: "20240601"
    if (/^\d{8}$/.test(input)) {
        const year = Number(input.slice(0, 4));
        const month = Number(input.slice(4, 6));
        const day = Number(input.slice(6, 8));
        return month >= 1 && month <= 12 && isValidDate(year, month, day) ? { year, month, day } : null;
    }

    // Year-first numeric: "2024-06-01", "2024/06/01", "2024.06.01"
    const yearFirstMatch = input.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (yearFirstMatch) {
        const year = Number(yearFirstMatch[1]);
        const month = Number(yearFirstMatch[2]);
        const day = Number(yearFirstMatch[3]);
        return month >= 1 && month <= 12 && isValidDate(year, month, day) ? { year, month, day } : null;
    }

    // Day-first numeric: "01-06-2024", "01/06/2024", "01.06.2024"
    //     Disambiguated by requiring the 4-digit year at the end.
    //     Treated as DD-MM-YYYY (day first, month second) which is the dominant
    //     international convention. If the values also make a valid MM-DD-YYYY
    //     date, day-first wins because it's far more common worldwide.
    const dayFirstMatch = input.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dayFirstMatch) {
        const a = Number(dayFirstMatch[1]);
        const b = Number(dayFirstMatch[2]);
        const year = Number(dayFirstMatch[3]);

        // Disambiguate DD-MM-YYYY vs MM-DD-YYYY: test DD-MM-YYYY first (dominant international standard)
        // and fall back to MM-DD-YYYY if day > 12.
        if (b >= 1 && b <= 12 && isValidDate(year, b, a)) {
            return { year, month: b, day: a };
        }
        // Fall back to MM-DD-YYYY.
        if (a >= 1 && a <= 12 && isValidDate(year, a, b)) {
            return { year, month: a, day: b };
        }
        return null;
    }

    // Text month with day: "June 1, 2024", "Jun 1 2024", "1 June 2024", "01-Jun-2024"
    const textMonthDayPatterns = [
        // "June 1, 2024" or "Jun 1 2024"
        /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/,
        // "1 June 2024" or "01 Jun 2024"
        /^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/,
        // "01-Jun-2024" or "01/Jun/2024"
        /^(\d{1,2})[-/]([A-Za-z]+)[-/](\d{4})$/,
        // "2024-Jun-01" or "2024/Jun/01"
        /^(\d{4})[-/]([A-Za-z]+)[-/](\d{1,2})$/,
    ];

    for (const pattern of textMonthDayPatterns) {
        const m = input.match(pattern);
        if (!m) continue;

        let year: number, month: number | undefined, day: number;

        if (/^\d{4}$/.test(m[1])) {
            // Year-first variant: "2024-Jun-01"
            year = Number(m[1]);
            month = parseMonthName(m[2]);
            day = Number(m[3]);
        } else if (/^\d{1,2}$/.test(m[1])) {
            // Day-first variant: "1 June 2024" or "01-Jun-2024"
            day = Number(m[1]);
            month = parseMonthName(m[2]);
            year = Number(m[3]);
        } else {
            // Month-first variant: "June 1, 2024"
            month = parseMonthName(m[1]);
            day = Number(m[2]);
            year = Number(m[3]);
        }

        if (month !== undefined && isValidDate(year, month, day)) {
            return { year, month, day };
        }
    }

    // Text month without day: "Jun 2024", "June 2024"
    const textMonthOnlyMatch = input.match(/^([A-Za-z]+)\s+(\d{4})$/) ?? input.match(/^(\d{4})\s+([A-Za-z]+)$/);
    if (textMonthOnlyMatch) {
        const nameToken = /^\d/.test(textMonthOnlyMatch[1]) ? textMonthOnlyMatch[2] : textMonthOnlyMatch[1];
        const yearToken = /^\d/.test(textMonthOnlyMatch[1]) ? textMonthOnlyMatch[1] : textMonthOnlyMatch[2];
        const month = parseMonthName(nameToken);
        const year = Number(yearToken);
        if (month !== undefined && year >= 1 && year <= 9999) {
            return { year, month };
        }
    }

    return null;
}
