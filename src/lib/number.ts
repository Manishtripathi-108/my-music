/**
 * Generic Isomorphic Number Parsing & Sanitization Utilities.
 * Client-safe and server-safe (zero Node dependencies).
 */

const DECIMAL_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
const INTEGER_PATTERN = /^\d+$/;

export function parseFiniteNumber(value: unknown): number | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined;
    }

    if (typeof value !== 'string') return undefined;

    const normalized = value.trim();
    if (!DECIMAL_PATTERN.test(normalized)) return undefined;

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseFiniteInteger(value: unknown): number | undefined {
    const normalized = String(value).trim();
    if (!INTEGER_PATTERN.test(normalized)) return undefined;

    const parsed = Number(normalized);
    return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export function parseString(value: unknown): string | undefined {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed || undefined;
    }

    return String(value);
}

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off']);

export function parseBoolean(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') return value;
    if (value === 1) return true;
    if (value === 0) return false;

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();

        if (TRUE_VALUES.has(normalized)) return true;
        if (FALSE_VALUES.has(normalized)) return false;
    }

    return undefined;
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
