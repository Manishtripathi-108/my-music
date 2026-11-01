import { getSavedItem, isBrowser, safeGetItem, safeSetItem, subscribeToStorage } from '@/lib/storage';

import {
    DARK_QUERY,
    DEFAULT_MODE,
    DEFAULT_SHAPE,
    MODES,
    MODE_CHANGE_EVENT,
    MODE_STORAGE_KEY,
    SHAPE_CHANGE_EVENT,
    SHAPE_STORAGE_KEY,
    TRANSITION_SHAPES,
    getNextItem,
} from './constants';
import { updateMetaColor } from './meta-color';
import type { ActiveMode, ColorMode, TransitionShape } from './types';

/* ---------------------------------- Mode ---------------------------------- */

/**
 * Checks whether a value is a valid {@link ColorMode}.
 *
 * @param value - The value to validate.
 * @returns `true` if the value matches one of the known modes ('light', 'dark', 'system').
 */
export function isValidMode(value: unknown): value is ColorMode {
    return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}

/**
 * Reads the saved color mode from localStorage.
 *
 * @returns The saved mode, or `'system'` if nothing valid is saved or storage fails.
 */
export const getSavedMode = (): ColorMode => {
    return getSavedItem(MODE_STORAGE_KEY, isValidMode, DEFAULT_MODE);
};

/**
 * Asks the browser which mode the OS prefers.
 *
 * @returns `'dark'` or `'light'`.
 */
export const getSystemMode = (): ActiveMode => (isBrowser ? (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light') : 'dark');

/**
 * Turns a mode into the active mode that should be shown.
 * `'system'` becomes the OS mode, other modes stay as they are.
 *
 * @param mode - The mode to convert.
 * @returns `'light'` or `'dark'`.
 */
export const toActiveMode = (mode: ColorMode): ActiveMode => (mode === 'system' ? getSystemMode() : mode);

/**
 * Returns the mode that follows the given one: light → dark → system → light.
 *
 * @param mode - The current mode.
 * @returns The next mode in the cycle.
 */
export const getNextMode = (mode: ColorMode): ColorMode => {
    return getNextItem(MODES, mode);
};

/**
 * Applies a color mode to the page: toggles the `dark` class
 * and updates the meta color using the default metavar. Skips everything if the mode is already applied.
 *
 * @param activeMode - The active mode ('light' | 'dark').
 */
export const applyModeToDOM = (activeMode: ActiveMode): void => {
    const root = document.documentElement;
    const isDark = activeMode === 'dark';

    if (root.classList.contains('dark') === isDark) return;

    root.classList.toggle('dark', isDark);
    updateMetaColor();
};

/**
 * Persists the color mode to localStorage and dispatches a change event
 * so other components and tabs stay in sync.
 *
 * @param mode - The mode to save.
 * @param activeMode - The resolved active mode.
 * @param duration - Animation duration in ms.
 * @param shape - The current transition shape.
 */
export const persistMode = (mode: ColorMode): void => {
    if (!isBrowser) return;

    applyModeToDOM(toActiveMode(mode));
    safeSetItem(MODE_STORAGE_KEY, mode);
    window.dispatchEvent(new CustomEvent(MODE_CHANGE_EVENT));
};

/**
 * Subscribes to mode changes, both from other tabs (`storage` event)
 * and from the same tab (custom event). Made for `useSyncExternalStore`.
 *
 * @param onChange - Called whenever the mode may have changed.
 * @returns A function that removes the listeners.
 */
export function subscribeToMode(onChange: () => void): () => void {
    return subscribeToStorage(MODE_STORAGE_KEY, MODE_CHANGE_EVENT, onChange);
}

/* --------------------------------- Shape ---------------------------------- */

/**
 * Reads the saved transition shape from localStorage.
 *
 * @returns The saved shape, or `'circle'` if nothing valid is saved or storage fails.
 */
export const getSavedShape = (): TransitionShape => {
    const saved = safeGetItem(SHAPE_STORAGE_KEY);

    if (saved && TRANSITION_SHAPES.some((option) => option.id === saved)) {
        return saved as TransitionShape;
    }

    return DEFAULT_SHAPE;
};

/**
 * Persists the transition shape to localStorage and dispatches a change event.
 *
 * @param shape - The shape to save.
 */
export const persistShape = (shape: TransitionShape): void => {
    if (!isBrowser) return;

    safeSetItem(SHAPE_STORAGE_KEY, shape);
    window.dispatchEvent(new CustomEvent(SHAPE_CHANGE_EVENT));
};

/* --------------------------------- System --------------------------------- */

export function subscribeToShape(onChange: () => void): () => void {
    return subscribeToStorage(SHAPE_STORAGE_KEY, SHAPE_CHANGE_EVENT, onChange);
}

export const subscribeToSystemMode = (onChange: () => void) => {
    if (!isBrowser) return () => undefined;

    const media = window.matchMedia(DARK_QUERY);

    media.addEventListener('change', onChange);

    return () => {
        media.removeEventListener('change', onChange);
    };
};
