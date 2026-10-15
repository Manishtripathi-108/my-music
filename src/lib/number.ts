/**
 * Generic Isomorphic Number Parsing & Sanitization Utilities.
 * Client-safe and server-safe (zero Node dependencies).
 */

/**
 * Parses an unknown value into a guaranteed finite number.
 * Returns `fallback` (defaults to 0) if the value is null, undefined, empty, NaN, or non-finite.
 *
 * @param value - Value to parse.
 * @param fallback - Fallback number if parsing fails. Default is 0.
 */
export function parseNumber(value: unknown, fallback = 0): number {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

/**
 * Parses an unknown value into an optional finite number.
 * Returns `undefined` if the value is null, undefined, empty, NaN, or non-finite.
 * Useful for optional technical specs where 0 is distinct from omitted/unknown.
 *
 * @param value - Value to parse.
 */
export function parseOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
}

/**
 * Parses an integer from an unknown value.
 * Handles fractional or split strings (e.g. "03/12" -> 3) commonly returned in audio metadata tags.
 *
 * @param value - Value to parse.
 */
export function parseInteger(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    const str = String(value).split('/')[0]?.trim();
    if (!str) {
        return undefined;
    }
    const parsed = Number.parseInt(str, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Parses a floating-point number from an unknown value.
 *
 * @param value - Value to parse.
 */
export function parseFloatNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    const parsed = Number.parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Clamps a numeric value between a minimum and maximum boundary.
 *
 * @param value - Number to clamp.
 * @param min - Minimum allowed value.
 * @param max - Maximum allowed value.
 */
export function clamp(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
}
