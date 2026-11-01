'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { flushSync } from 'react-dom';

import {
    applyModeToDOM,
    getNextMode,
    getSavedMode,
    getSavedShape,
    getSystemMode,
    persistMode,
    persistShape,
    subscribeToMode,
    subscribeToShape,
    subscribeToSystemMode,
    toActiveMode,
} from '@/lib/theme/color-mode';
import { applyColorSchemeToDOM, getNextColorScheme, getSavedColorScheme, persistColorScheme, subscribeToColorScheme } from '@/lib/theme/color-scheme';
import { COLOR_SCHEMES, DEFAULT_COLOR_SCHEME, DEFAULT_MODE, DEFAULT_SHAPE, MODES, TRANSITION_SHAPES } from '@/lib/theme/constants';
import { updateMetaColor } from '@/lib/theme/meta-color';
import { isBrowser } from '@/lib/storage';
import { getClipPaths } from '@/lib/theme/transitions';
import type { ActiveMode, UseThemeOptions, UseThemeReturn } from '@/lib/theme/types';

/* ---------------------------------- Hook ---------------------------------- */

/**
 * Unified hook for managing the application's color mode, color scheme,
 * and transition shape.
 *
 * - Saves choices in localStorage and keeps all tabs and components in sync.
 * - Applies the color mode to the page (`dark` class, meta color).
 * - Applies the color scheme to the page (`data-theme` attribute).
 * - Follows OS changes while the mode is `'system'`.
 * - Can play a reveal animation using the View Transition API.
 *
 * @param options - Optional settings, see {@link UseThemeOptions}.
 * @returns Current state and actions, see {@link UseThemeReturn}.
 *
 * @example
 * const { mode, activeMode, colorScheme, cycleModeAnimated, setColorScheme } = useTheme();
 *
 * <button onClick={(e) => cycleModeAnimated(e.clientX, e.clientY)}>
 *     {activeMode}
 * </button>
 */
const useTheme = ({ duration = 450 }: UseThemeOptions = {}): UseThemeReturn => {
    const mode = useSyncExternalStore(subscribeToMode, getSavedMode, () => DEFAULT_MODE);
    const shape = useSyncExternalStore(subscribeToShape, getSavedShape, () => DEFAULT_SHAPE);
    const colorScheme = useSyncExternalStore(subscribeToColorScheme, getSavedColorScheme, () => DEFAULT_COLOR_SCHEME);
    const systemMode = useSyncExternalStore(subscribeToSystemMode, getSystemMode, (): ActiveMode => 'light');

    const activeMode = mode === 'system' ? systemMode : mode;

    const setMode = useCallback<UseThemeReturn['setMode']>((value) => {
        const newMode = typeof value === 'function' ? value(getSavedMode()) : value;

        persistMode(newMode);
    }, []);

    const setShape = useCallback((newShape: typeof shape) => {
        persistShape(newShape);
    }, []);

    const setColorScheme = useCallback((scheme: typeof colorScheme) => {
        persistColorScheme(scheme);
    }, []);

    const cycleColorScheme = useCallback(() => {
        setColorScheme(getNextColorScheme(getSavedColorScheme()));
    }, [setColorScheme]);

    /** Moves to the next mode without animation. */
    const cycleMode = useCallback(() => {
        setMode((current) => getNextMode(current));
    }, [setMode]);

    const setModeAnimated = useCallback(
        (newMode: typeof mode, x?: number, y?: number, shapeOverride?: typeof shape) => {
            const prefersReducedMotion = isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (typeof document === 'undefined' || typeof document.startViewTransition !== 'function' || prefersReducedMotion) {
                setMode(newMode);
                return;
            }

            const chosenShape = shapeOverride ?? shape;

            const transition = document.startViewTransition(() => {
                flushSync(() => setMode(newMode));
            });

            void transition.ready
                .then(() => {
                    const width = window.innerWidth;
                    const height = window.innerHeight;

                    const originX = Math.min(Math.max(x ?? width / 2, 0), width);
                    const originY = Math.min(Math.max(y ?? height / 2, 0), height);

                    const [startClip, endClip] = getClipPaths(chosenShape, originX, originY, width, height);

                    document.documentElement.animate(
                        { clipPath: [startClip, endClip] },
                        {
                            duration,
                            easing: 'ease-in-out',
                            pseudoElement: '::view-transition-new(root)',
                        }
                    );
                })
                .catch(() => {
                    // The mode has changed even if the custom animation fails.
                });
        },
        [setMode, duration, shape]
    );

    /** Moves to the next mode with a reveal animation starting at (x, y). */
    const cycleModeAnimated = useCallback(
        (x?: number, y?: number, shapeOverride?: typeof shape) => {
            setModeAnimated(getNextMode(getSavedMode()), x, y, shapeOverride);
        },
        [setModeAnimated]
    );

    // Keep the page in sync on mount and whenever mode or color scheme changes.
    // Only touches the DOM and never writes to localStorage,
    // so it can't overwrite the user's saved choice during hydration.
    useEffect(() => {
        applyModeToDOM(activeMode);
        updateMetaColor();
    }, [activeMode]);

    useEffect(() => {
        applyColorSchemeToDOM(colorScheme);
    }, [colorScheme]);

    return {
        mode,
        activeMode: toActiveMode(mode),
        nextMode: getNextMode(mode),
        shape,
        shapes: TRANSITION_SHAPES,
        setMode,
        setShape,
        cycleMode,
        setModeAnimated,
        cycleModeAnimated,
        colorScheme,
        setColorScheme,
        cycleColorScheme,
        colorSchemes: COLOR_SCHEMES,
        modes: MODES,
    };
};

export { ThemeScript } from '@/components/providers/ThemeScript';
export { MODES } from '@/lib/theme/constants';
export { updateMetaColor } from '@/lib/theme/meta-color';

export default useTheme;
