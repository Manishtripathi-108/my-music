/* ------------------------ Formatting Utilities ---------------------------- */

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
 * Formats an ISO timestamp or date into a localized time string.
 * Safe against invalid date strings.
 *
 * @param date - Date object, ISO string, or timestamp.
 * @returns Localized time string or empty string on invalid date.
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
