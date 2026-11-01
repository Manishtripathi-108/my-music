import { dispatchStorageEvent, getSavedItem, isBrowser, safeSetItem, subscribeToStorage } from '@/lib/storage';

import { COLOR_SCHEMES, COLOR_SCHEME_CHANGE_EVENT, COLOR_SCHEME_IDS, COLOR_SCHEME_STORAGE_KEY, DEFAULT_COLOR_SCHEME, getNextItem } from './constants';
import { updateMetaColor } from './meta-color';
import type { ColorScheme } from './types';

/**
 * Checks whether a value is a valid {@link ColorScheme} identifier.
 *
 * @param value - The value to validate.
 * @returns `true` if the value matches a known color scheme id.
 */
export function isValidColorScheme(value: unknown): value is ColorScheme {
    return typeof value === 'string' && COLOR_SCHEMES.some((s) => s.id === value);
}

/**
 * Reads the saved color scheme from localStorage, falling back to the default.
 *
 * @returns The saved color scheme, or DEFAULT_COLOR_SCHEME if nothing valid is found or storage fails.
 */
export function getSavedColorScheme(): ColorScheme {
    return getSavedItem(COLOR_SCHEME_STORAGE_KEY, isValidColorScheme, DEFAULT_COLOR_SCHEME);
}

/**
 * Returns the color scheme that follows the given one in circular order.
 *
 * @param current - The current active color scheme.
 * @returns The next color scheme in the sequence.
 */
export function getNextColorScheme(current: ColorScheme): ColorScheme {
    return getNextItem(COLOR_SCHEME_IDS, current);
}

/**
 * Applies the color scheme to the root element's `data-theme` attribute
 * and updates the `<meta name="theme-color">` tag using the default metavar.
 *
 * @param scheme - The color scheme to apply.
 */
export function applyColorSchemeToDOM(scheme: ColorScheme): void {
    if (!isBrowser) return;

    document.documentElement.setAttribute('data-theme', scheme);
    updateMetaColor();
}

/**
 * Persists the color scheme to localStorage, applies it to the DOM,
 * updates the meta color tag, and dispatches a change event.
 *
 * @param scheme - The color scheme to persist and apply.
 */
export function persistColorScheme(scheme: ColorScheme): void {
    if (!isValidColorScheme(scheme)) return;

    applyColorSchemeToDOM(scheme);
    safeSetItem(COLOR_SCHEME_STORAGE_KEY, scheme);
    dispatchStorageEvent(COLOR_SCHEME_CHANGE_EVENT, scheme);
}

/**
 * Subscribes to color scheme changes, both from other tabs (`storage` event)
 * and from the same tab (custom event). Made for `useSyncExternalStore`.
 *
 * @param onChange - Called whenever the color scheme may have changed.
 * @returns A function that removes the listeners.
 */
export function subscribeToColorScheme(onChange: () => void): () => void {
    return subscribeToStorage(COLOR_SCHEME_STORAGE_KEY, COLOR_SCHEME_CHANGE_EVENT, onChange);
}
