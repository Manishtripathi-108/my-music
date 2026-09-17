'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { flushSync } from 'react-dom';

import { isBrowser } from '@/lib/utils/core.utils';

/* ---------------------------------- Types --------------------------------- */
export type ThemeType = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export type TransitionShape = 'circle' | 'diamond' | 'square' | 'star' | 'hexagon' | 'wipe-down' | 'wipe-up' | 'wipe-right' | 'wipe-left';

export interface ShapeOption {
    id: TransitionShape;
    label: string;
    description: string;
}

type ThemeMetaMode = 'css-variable' | 'custom';

type ThemeMetaConfig = {
    mode?: ThemeMetaMode;
    light?: string;
    dark?: string;
    cssVar?: string;
};

type ThemeChangeDetail = {
    theme: ThemeType;
    resolvedTheme: ResolvedTheme;
    duration: number;
    shape: TransitionShape;
};

/* -------------------------------- Constants ------------------------------- */
const THEME_KEY = 'theme';
const THEME_CHANGE_EVENT = 'my-music-theme-change';

const SHAPE_KEY = 'theme-transition-shape';
const SHAPE_CHANGE_EVENT = 'my-music-shape-change';
const DEFAULT_SHAPE: TransitionShape = 'circle';

const PREFERS_COLOR_SCHEME_DARK = '(prefers-color-scheme: dark)';
const DEFAULT_META_CSS_VAR = '--color-background';

export const TRANSITION_SHAPES: ShapeOption[] = [
    { id: 'circle', label: 'Circle', description: 'Expanding circular ripple (Default)' },
    { id: 'diamond', label: 'Diamond', description: 'Geometric 45° rhombus expansion' },
    { id: 'square', label: 'Square', description: 'Expanding box from click origin' },
    { id: 'star', label: 'Star', description: 'Dynamic 4-point sparkle bloom' },
    { id: 'hexagon', label: 'Hexagon', description: 'Futuristic 6-sided polygon reveal' },
    { id: 'wipe-down', label: 'Curtain Down', description: 'Top-to-bottom waterfall sweep' },
    { id: 'wipe-up', label: 'Curtain Up', description: 'Bottom-to-top waterfall sweep' },
    { id: 'wipe-right', label: 'Cinematic Right', description: 'Left-to-right cinematic wipe' },
    { id: 'wipe-left', label: 'Cinematic Left', description: 'Right-to-left cinematic wipe' },
];

/** ---------------------------------- Utils --------------------------------- */

/* Read theme from localStorage. Falls back to system. */
const getStoredTheme = (): ThemeType => {
    if (isBrowser) {
        const stored = localStorage.getItem(THEME_KEY) as ThemeType | null;

        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            return stored;
        }
    }

    return 'system';
};

/* Read transition shape from localStorage. Defaults to circle. */
const getStoredShape = (): TransitionShape => {
    if (isBrowser) {
        const stored = localStorage.getItem(SHAPE_KEY) as TransitionShape | null;
        if (stored && TRANSITION_SHAPES.some((s) => s.id === stored)) {
            return stored;
        }
    }

    return DEFAULT_SHAPE;
};

const getSystemTheme = (): ResolvedTheme => (window.matchMedia(PREFERS_COLOR_SCHEME_DARK).matches ? 'dark' : 'light');

/* Convert system theme to concrete light or dark. */
const resolveTheme = (theme: ThemeType): ResolvedTheme => (theme === 'system' ? getSystemTheme() : theme);

/* Apply theme to DOM root and update meta theme color. */
const applyThemeToDOM = (theme: ResolvedTheme, metaConfig: ThemeMetaConfig | undefined) => {
    const root = document.documentElement;

    if (root.dataset.theme === theme) return;

    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');

    const meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) return;

    let color = '';

    if (metaConfig?.mode === 'custom') {
        color = theme === 'dark' ? (metaConfig.dark ?? '') : (metaConfig.light ?? '');
    } else {
        const variable = metaConfig?.cssVar ?? DEFAULT_META_CSS_VAR;
        color = getComputedStyle(root).getPropertyValue(variable);
    }

    if (color) meta.setAttribute('content', color.trim());
};

const getNextTheme = (theme: ThemeType): ThemeType => {
    if (theme === 'light') return 'dark';
    if (theme === 'dark') return 'system';
    return 'light';
};

/* Sync theme across tabs and within the same tab via custom event. */
const subscribeToTheme = (onStoreChange: () => void) => {
    if (!isBrowser) {
        return () => undefined;
    }

    const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === THEME_KEY) {
            onStoreChange();
        }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    };
};

/* Sync transition shape across tabs and components. */
const subscribeToShape = (onStoreChange: () => void) => {
    if (!isBrowser) {
        return () => undefined;
    }

    const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === SHAPE_KEY) {
            onStoreChange();
        }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SHAPE_CHANGE_EVENT, onStoreChange);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(SHAPE_CHANGE_EVENT, onStoreChange);
    };
};

/**
 * Generate keyframes for clip-path animation according to selected shape
 */
const getShapeClipPaths = (shape: TransitionShape, cx: number, cy: number, w: number, h: number): [string, string] => {
    const maxCornerDist = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));

    switch (shape) {
        case 'diamond': {
            // Rhombus expanding from (cx, cy)
            const r = (Math.max(cx, w - cx) + Math.max(cy, h - cy)) * 1.2;
            return [
                `polygon(${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px)`,
                `polygon(${cx}px ${cy - r}px, ${cx + r}px ${cy}px, ${cx}px ${cy + r}px, ${cx - r}px ${cy}px)`,
            ];
        }

        case 'square': {
            // Centered square expanding outward from click position
            const r = Math.max(cx, w - cx, cy, h - cy) * 1.45;
            return [
                `polygon(${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px)`,
                `polygon(${cx - r}px ${cy - r}px, ${cx + r}px ${cy - r}px, ${cx + r}px ${cy + r}px, ${cx - r}px ${cy + r}px)`,
            ];
        }

        case 'star': {
            // 4-point sparkle with 8 vertices
            const innerR = maxCornerDist * 1.35;
            const outerR = innerR * 2.8;
            return [
                `polygon(${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px)`,
                `polygon(${cx}px ${cy - outerR}px, ${cx + innerR * 0.7}px ${cy - innerR * 0.7}px, ${cx + outerR}px ${cy}px, ${cx + innerR * 0.7}px ${cy + innerR * 0.7}px, ${cx}px ${cy + outerR}px, ${cx - innerR * 0.7}px ${cy + innerR * 0.7}px, ${cx - outerR}px ${cy}px, ${cx - innerR * 0.7}px ${cy - innerR * 0.7}px)`,
            ];
        }

        case 'hexagon': {
            // 6-sided polygon expanding outward
            const r = maxCornerDist * 1.35;
            const sin30 = 0.5;
            const cos30 = 0.866025;
            return [
                `polygon(${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px, ${cx}px ${cy}px)`,
                `polygon(${cx}px ${cy - r}px, ${cx + r * cos30}px ${cy - r * sin30}px, ${cx + r * cos30}px ${cy + r * sin30}px, ${cx}px ${cy + r}px, ${cx - r * cos30}px ${cy + r * sin30}px, ${cx - r * cos30}px ${cy - r * sin30}px)`,
            ];
        }

        case 'wipe-down': {
            return ['polygon(0 0, 100% 0, 100% 0, 0 0)', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'];
        }

        case 'wipe-up': {
            return ['polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'];
        }

        case 'wipe-right': {
            return ['polygon(0 0, 0 0, 0 100%, 0 100%)', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'];
        }

        case 'wipe-left': {
            return ['polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'];
        }

        case 'circle':
        default: {
            return [`circle(0px at ${cx}px ${cy}px)`, `circle(${maxCornerDist}px at ${cx}px ${cy}px)`];
        }
    }
};

/**
 * React hook that manages application color theme and transition shape.
 *
 * The hook provides the current theme, next theme, transition shape, and functions to set or cycle the theme and shape.
 * It also handles applying the theme to the DOM and syncing across tabs.
 *
 * @returns An object containing the current theme, next theme, transition shape, and functions to set or cycle the theme and shape.
 */
const useTheme = ({
    duration = 450,
    meta,
}: {
    duration?: number;
    meta?: ThemeMetaConfig;
} = {}) => {
    const syncedTheme = useSyncExternalStore<ThemeType>(subscribeToTheme, getStoredTheme, () => 'system');
    const syncedShape = useSyncExternalStore<TransitionShape>(subscribeToShape, getStoredShape, () => DEFAULT_SHAPE);

    const nextTheme = getNextTheme(syncedTheme);

    /** Apply theme to DOM root and update meta theme color */
    const applyTheme = useCallback(
        (themeValue: ThemeType, currentShape: TransitionShape = syncedShape) => {
            const resolved = resolveTheme(themeValue);

            applyThemeToDOM(resolved, meta);

            if (isBrowser) {
                localStorage.setItem(THEME_KEY, themeValue);

                const event = new CustomEvent<ThemeChangeDetail>(THEME_CHANGE_EVENT, {
                    detail: {
                        theme: themeValue,
                        resolvedTheme: resolved,
                        duration,
                        shape: currentShape,
                    },
                });

                // Dispatch a custom event to notify other tabs and components of the theme change
                window.dispatchEvent(event);
            }
        },
        [meta, duration, syncedShape]
    );

    /** Set the theme only */
    const setTheme = useCallback(
        (value: ThemeType | ((theme: ThemeType) => ThemeType)) => {
            const nextThemeValue = typeof value === 'function' ? value(getStoredTheme()) : value;
            applyTheme(nextThemeValue);
        },
        [applyTheme]
    );

    /** Set the transition shape and update the DOM */
    const setShape = useCallback((newShape: TransitionShape) => {
        if (!isBrowser) return;
        localStorage.setItem(SHAPE_KEY, newShape);
        window.dispatchEvent(new CustomEvent(SHAPE_CHANGE_EVENT));
    }, []);

    // Sync DOM on mount and when theme changes.
    // Only touches the DOM - does NOT write to localStorage,
    // so it can't overwrite the user's stored preference during hydration.
    useEffect(() => {
        if (!isBrowser) return;

        const resolved = resolveTheme(syncedTheme);
        applyThemeToDOM(resolved, meta);

        // When theme is system listen to OS preference changes.
        if (syncedTheme !== 'system') return;

        const media = window.matchMedia(PREFERS_COLOR_SCHEME_DARK);
        const handleChange = () => {
            const resolved = resolveTheme('system');
            applyThemeToDOM(resolved, meta);
        };

        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, [syncedTheme, meta]);

    const cycleTheme = useCallback(() => {
        setTheme((currentTheme) => getNextTheme(currentTheme));
    }, [setTheme]);

    const animateToggleTheme = useCallback(
        (x?: number, y?: number, shapeOverride?: TransitionShape) => {
            /* Fallback when View Transition API is not supported. */
            if (typeof document === 'undefined' || !('startViewTransition' in document)) {
                cycleTheme();
                return;
            }

            const activeShape = shapeOverride ?? syncedShape;

            const transition = document.startViewTransition(() => {
                flushSync(cycleTheme);
            });

            transition?.ready?.then(() => {
                const cx = x ?? window.innerWidth / 2;
                const cy = y ?? window.innerHeight / 2;
                const w = window.innerWidth;
                const h = window.innerHeight;

                const [startClip, endClip] = getShapeClipPaths(activeShape, cx, cy, w, h);

                document.documentElement.animate(
                    {
                        clipPath: [startClip, endClip],
                    },
                    {
                        duration,
                        easing: 'ease-in-out',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
            });
        },
        [cycleTheme, duration, syncedShape]
    );

    return {
        theme: syncedTheme,
        nextTheme,
        shape: syncedShape,
        availableShapes: TRANSITION_SHAPES,
        setTheme,
        setShape,
        cycleTheme,
        animateToggleTheme,
    };
};

/**
 * Inline script that runs before React hydration.
 *
 * Prevents a flash of incorrect theme by applying
 * the stored theme immediately during page load.
 */
export const ThemeScript = () => {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
                    (function () {
                        try {
                            const theme = localStorage.getItem('${THEME_KEY}') || 'system';
                            const prefersDark = window.matchMedia('${PREFERS_COLOR_SCHEME_DARK}').matches;
                            const appliedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;

                            document.documentElement.setAttribute('data-theme', appliedTheme);
                            document.documentElement.classList.toggle('dark', appliedTheme === 'dark');
                        } catch (e) {
                            console.error("Error applying theme:", e);
                        }
                    })();
                `,
            }}
        />
    );
};

export default useTheme;
