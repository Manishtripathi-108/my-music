'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { flushSync } from 'react-dom';

import { isBrowser } from '@/lib/utils/core.utils';

/* ---------------------------------- Types --------------------------------- */

/** The theme the user picked. `'system'` follows the OS setting. */
export type ThemeMode = 'light' | 'dark' | 'system';

/** The theme actually shown on screen (`'system'` already turned into light or dark). */
export type ActiveTheme = 'light' | 'dark';

/** Shape of the reveal animation played when the theme changes. */
export type TransitionShape = 'circle' | 'diamond' | 'square' | 'star' | 'hexagon' | 'wipe-down' | 'wipe-up' | 'wipe-right' | 'wipe-left';

/** A transition shape plus display text. Handy for building a shape picker. */
export interface ShapeOption {
    /** Shape id. This is also the value saved in localStorage. */
    id: TransitionShape;
    /** Short name to show in the UI. */
    label: string;
    /** One-line description of how the animation looks. */
    description: string;
}

/** Where the `theme-color` meta tag gets its value from. */
export type MetaColorMode = 'css-variable' | 'custom';

/** Controls how the `<meta name="theme-color">` tag is updated. */
export type MetaColorConfig = {
    /** `'css-variable'` reads a CSS variable, `'custom'` uses `light` / `dark` below. */
    mode?: MetaColorMode;
    /** Color used in light theme when `mode` is `'custom'`. */
    light?: string;
    /** Color used in dark theme when `mode` is `'custom'`. */
    dark?: string;
    /** CSS variable to read when `mode` is `'css-variable'`. Defaults to `--color-background`. */
    cssVar?: string;
};

/** Data sent with the theme change event. */
export type ThemeChangeDetail = {
    /** The mode the user picked. */
    mode: ThemeMode;
    /** The theme now shown on screen. */
    activeTheme: ActiveTheme;
    /** Animation length in milliseconds. */
    duration: number;
    /** Shape that was selected at the time of the change. */
    shape: TransitionShape;
};

/** Options accepted by {@link useTheme}. */
export interface UseThemeOptions {
    /** Animation length in milliseconds. Defaults to `450`. */
    duration?: number;
    /** Settings for the browser `theme-color` meta tag. */
    metaColor?: MetaColorConfig;
}

/** Sets a mode directly, or computes it from the current one. */
export type SetMode = (value: ThemeMode | ((current: ThemeMode) => ThemeMode)) => void;

/** Value returned by {@link useTheme}. */
export interface UseThemeReturn {
    /** The mode the user picked (`'light'`, `'dark'` or `'system'`). */
    mode: ThemeMode;
    /** The theme currently shown on screen (`'light'` or `'dark'`). */
    activeTheme: ActiveTheme;
    /** The mode that comes after the current one when cycling. */
    nextMode: ThemeMode;
    /** The selected transition shape. */
    shape: TransitionShape;
    /** All transition shapes the user can choose from. */
    shapes: ShapeOption[];
    /** Set the mode, or pass a function that receives the current mode. */
    setMode: SetMode;
    /** Set the transition shape. */
    setShape: (shape: TransitionShape) => void;
    /** Jump to the next mode (light → dark → system) without animation. */
    cycleMode: () => void;
    /**
     * Jump to the next mode with a reveal animation.
     * Falls back to {@link UseThemeReturn.cycleMode} if the View Transition API is missing.
     *
     * @param x - Animation start X in px. Defaults to screen center.
     * @param y - Animation start Y in px. Defaults to screen center.
     * @param shapeOverride - Use this shape once instead of the saved one.
     */
    cycleModeAnimated: (x?: number, y?: number, shapeOverride?: TransitionShape) => void;
}

/* -------------------------------- Constants ------------------------------- */

/** localStorage key that stores the selected mode. */
const THEME_STORAGE_KEY = 'theme';

/** Window event fired when the mode changes in the current tab. */
const THEME_CHANGE_EVENT = 'my-music-theme-change';

/** Mode used when nothing is saved yet. */
const DEFAULT_MODE: ThemeMode = 'system';

/** localStorage key that stores the selected transition shape. */
const SHAPE_STORAGE_KEY = 'theme-transition-shape';

/** Window event fired when the shape changes in the current tab. */
const SHAPE_CHANGE_EVENT = 'my-music-shape-change';

/** Shape used when nothing is saved yet. */
const DEFAULT_SHAPE: TransitionShape = 'circle';

/** Media query that matches when the OS prefers dark. */
const DARK_QUERY = '(prefers-color-scheme: dark)';

/** CSS variable read for the meta color when none is configured. */
const DEFAULT_META_VAR = '--color-background';

/** Clip path that covers the whole screen. Used as the end state of wipe animations. */
const FULL_SCREEN_CLIP = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

/** Every transition shape with its label and description. */
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

/* ---------------------------------- Utils --------------------------------- */

/**
 * Reads the saved mode from localStorage.
 *
 * @returns The saved mode, or `'system'` if nothing valid is saved.
 */
const getSavedMode = (): ThemeMode => {
    if (isBrowser) {
        const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;

        if (saved === 'light' || saved === 'dark' || saved === 'system') {
            return saved;
        }
    }

    return DEFAULT_MODE;
};

/**
 * Reads the saved transition shape from localStorage.
 *
 * @returns The saved shape, or `'circle'` if nothing valid is saved.
 */
const getSavedShape = (): TransitionShape => {
    if (isBrowser) {
        const saved = localStorage.getItem(SHAPE_STORAGE_KEY) as TransitionShape | null;

        if (saved && TRANSITION_SHAPES.some((option) => option.id === saved)) {
            return saved;
        }
    }

    return DEFAULT_SHAPE;
};

/**
 * Asks the browser which theme the OS prefers.
 *
 * @returns `'dark'` or `'light'`.
 */
const getSystemTheme = (): ActiveTheme => (isBrowser ? (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light') : 'dark');

/**
 * Turns a mode into the theme that should be shown.
 * `'system'` becomes the OS theme, other modes stay as they are.
 *
 * @param mode - The mode to convert.
 * @returns `'light'` or `'dark'`.
 */
const toActiveTheme = (mode: ThemeMode): ActiveTheme => (mode === 'system' ? getSystemTheme() : mode);

/**
 * Returns the mode that follows the given one: light → dark → system → light.
 *
 * @param mode - The current mode.
 * @returns The next mode in the cycle.
 */
const getNextMode = (mode: ThemeMode): ThemeMode => {
    if (mode === 'light') return 'dark';
    if (mode === 'dark') return 'system';
    return 'light';
};

/**
 * Updates the `<meta name="theme-color">` tag to match the active theme.
 * Does nothing if the tag does not exist or no color could be found.
 *
 * @param theme - The theme now shown on screen.
 * @param config - Where to get the color from.
 */
const updateMetaColor = (theme: ActiveTheme, config: MetaColorConfig | undefined) => {
    const metaTag = document.querySelector('meta[name="theme-color"]');

    if (!metaTag) return;

    let color = '';

    if (config?.mode === 'custom') {
        color = theme === 'dark' ? (config.dark ?? '') : (config.light ?? '');
    } else {
        const variable = config?.cssVar ?? DEFAULT_META_VAR;
        color = getComputedStyle(document.documentElement).getPropertyValue(variable);
    }

    if (color) metaTag.setAttribute('content', color.trim());
};

/**
 * Applies a theme to the page: sets `data-theme`, toggles the `dark` class
 * and updates the meta color. Skips everything if the theme is already applied.
 *
 * @param theme - The theme to show.
 * @param metaColor - Settings for the meta color update.
 */
const applyToDOM = (theme: ActiveTheme, metaColor: MetaColorConfig | undefined) => {
    const root = document.documentElement;

    if (root.dataset.theme === theme) return;

    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');

    updateMetaColor(theme, metaColor);
};

/**
 * Subscribes to mode changes, both from other tabs (`storage` event)
 * and from the same tab (custom event). Made for `useSyncExternalStore`.
 *
 * @param onChange - Called whenever the mode may have changed.
 * @returns A function that removes the listeners.
 */
const subscribeToMode = (onChange: () => void) => {
    if (!isBrowser) {
        return () => undefined;
    }

    const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === THEME_STORAGE_KEY) {
            onChange();
        }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(THEME_CHANGE_EVENT, onChange);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    };
};

/**
 * Subscribes to shape changes, both from other tabs (`storage` event)
 * and from the same tab (custom event). Made for `useSyncExternalStore`.
 *
 * @param onChange - Called whenever the shape may have changed.
 * @returns A function that removes the listeners.
 */
const subscribeToShape = (onChange: () => void) => {
    if (!isBrowser) {
        return () => undefined;
    }

    const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === SHAPE_STORAGE_KEY) {
            onChange();
        }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SHAPE_CHANGE_EVENT, onChange);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(SHAPE_CHANGE_EVENT, onChange);
    };
};

/**
 * Builds the start and end `clip-path` values for a shape animation.
 * The new theme is revealed as the clip path grows from start to end.
 *
 * @param shape - Which shape to animate.
 * @param x - Animation origin X in px.
 * @param y - Animation origin Y in px.
 * @param width - Viewport width in px.
 * @param height - Viewport height in px.
 * @returns A `[start, end]` pair of CSS `clip-path` values.
 */
const getClipPaths = (shape: TransitionShape, x: number, y: number, width: number, height: number): [string, string] => {
    /** Distance from the origin to the farthest screen corner. Big enough to cover the screen. */
    const coverRadius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));

    /** A polygon with all its points stacked on the origin. It is invisible, so it works as a start state. */
    const collapsed = (points: number) => `polygon(${new Array<string>(points).fill(`${x}px ${y}px`).join(', ')})`;

    switch (shape) {
        case 'diamond': {
            const reach = (Math.max(x, width - x) + Math.max(y, height - y)) * 1.2;
            return [collapsed(4), `polygon(${x}px ${y - reach}px, ${x + reach}px ${y}px, ${x}px ${y + reach}px, ${x - reach}px ${y}px)`];
        }

        case 'square': {
            // Half of the square's side length
            const half = Math.max(x, width - x, y, height - y) * 1.45;
            return [
                collapsed(4),
                `polygon(${x - half}px ${y - half}px, ${x + half}px ${y - half}px, ${x + half}px ${y + half}px, ${x - half}px ${y + half}px)`,
            ];
        }

        case 'star': {
            // 4-point sparkle made of 8 points: 4 tips (outer) and 4 dents (inner)
            const inner = coverRadius * 1.35;
            const outer = inner * 2.8;
            const diagonal = inner * 0.7;
            return [
                collapsed(8),
                `polygon(${x}px ${y - outer}px, ${x + diagonal}px ${y - diagonal}px, ${x + outer}px ${y}px, ${x + diagonal}px ${y + diagonal}px, ${x}px ${y + outer}px, ${x - diagonal}px ${y + diagonal}px, ${x - outer}px ${y}px, ${x - diagonal}px ${y - diagonal}px)`,
            ];
        }

        case 'hexagon': {
            const radius = coverRadius * 1.35;
            const dx = radius * 0.866025; // radius * cos(30°)
            const dy = radius * 0.5; // radius * sin(30°)
            return [
                collapsed(6),
                `polygon(${x}px ${y - radius}px, ${x + dx}px ${y - dy}px, ${x + dx}px ${y + dy}px, ${x}px ${y + radius}px, ${x - dx}px ${y + dy}px, ${x - dx}px ${y - dy}px)`,
            ];
        }

        case 'wipe-down': {
            return ['polygon(0 0, 100% 0, 100% 0, 0 0)', FULL_SCREEN_CLIP];
        }

        case 'wipe-up': {
            return ['polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', FULL_SCREEN_CLIP];
        }

        case 'wipe-right': {
            return ['polygon(0 0, 0 0, 0 100%, 0 100%)', FULL_SCREEN_CLIP];
        }

        case 'wipe-left': {
            return ['polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', FULL_SCREEN_CLIP];
        }

        case 'circle':
        default: {
            return [`circle(0px at ${x}px ${y}px)`, `circle(${coverRadius}px at ${x}px ${y}px)`];
        }
    }
};

/* ---------------------------------- Hook ---------------------------------- */

/**
 * Manages the app's color theme and the transition shape used when it changes.
 *
 * - Saves the choice in localStorage and keeps all tabs and components in sync.
 * - Applies the theme to the page (`data-theme`, `dark` class, meta color).
 * - Follows OS changes while the mode is `'system'`.
 * - Can play a reveal animation using the View Transition API.
 *
 * @param options - Optional settings, see {@link UseThemeOptions}.
 * @returns Current state and actions, see {@link UseThemeReturn}.
 *
 * @example
 * const { mode, activeTheme, cycleModeAnimated } = useTheme({ duration: 600 });
 *
 * <button onClick={(e) => cycleModeAnimated(e.clientX, e.clientY)}>
 *     {activeTheme}
 * </button>
 */
const useTheme = ({ duration = 450, metaColor }: UseThemeOptions = {}): UseThemeReturn => {
    const mode = useSyncExternalStore<ThemeMode>(subscribeToMode, getSavedMode, () => DEFAULT_MODE);
    const shape = useSyncExternalStore<TransitionShape>(subscribeToShape, getSavedShape, () => DEFAULT_SHAPE);

    const nextMode = getNextMode(mode);

    /** Applies a mode to the page, saves it and tells the rest of the app. */
    const applyMode = useCallback(
        (newMode: ThemeMode) => {
            const activeTheme = toActiveTheme(newMode);

            applyToDOM(activeTheme, metaColor);

            if (isBrowser) {
                localStorage.setItem(THEME_STORAGE_KEY, newMode);

                const event = new CustomEvent<ThemeChangeDetail>(THEME_CHANGE_EVENT, {
                    detail: { mode: newMode, activeTheme, duration, shape },
                });

                // Tells components in this tab. Other tabs are notified by the browser's `storage` event.
                window.dispatchEvent(event);
            }
        },
        [metaColor, duration, shape]
    );

    /** Sets the mode. Accepts a value or a function of the current mode. */
    const setMode = useCallback<SetMode>(
        (value) => {
            const newMode = typeof value === 'function' ? value(getSavedMode()) : value;
            applyMode(newMode);
        },
        [applyMode]
    );

    /** Saves the transition shape and tells the rest of the app. */
    const setShape = useCallback((newShape: TransitionShape) => {
        if (!isBrowser) return;
        localStorage.setItem(SHAPE_STORAGE_KEY, newShape);
        window.dispatchEvent(new CustomEvent(SHAPE_CHANGE_EVENT));
    }, []);

    // Keep the page in sync on mount and whenever the mode changes.
    // Only touches the DOM and never writes to localStorage,
    // so it can't overwrite the user's saved choice during hydration.
    useEffect(() => {
        if (!isBrowser) return;

        applyToDOM(toActiveTheme(mode), metaColor);

        // In system mode, follow OS theme changes.
        if (mode !== 'system') return;

        const media = window.matchMedia(DARK_QUERY);
        const handleOsChange = () => applyToDOM(toActiveTheme('system'), metaColor);

        media.addEventListener('change', handleOsChange);
        return () => media.removeEventListener('change', handleOsChange);
    }, [mode, metaColor]);

    /** Moves to the next mode without animation. */
    const cycleMode = useCallback(() => {
        setMode((current) => getNextMode(current));
    }, [setMode]);

    /** Moves to the next mode with a reveal animation starting at (x, y). */
    const cycleModeAnimated = useCallback(
        (x?: number, y?: number, shapeOverride?: TransitionShape) => {
            // Fallback when the View Transition API is not supported.
            if (typeof document === 'undefined' || !('startViewTransition' in document)) {
                cycleMode();
                return;
            }

            const chosenShape = shapeOverride ?? shape;

            const viewTransition = document.startViewTransition(() => {
                flushSync(cycleMode);
            });

            viewTransition?.ready?.then(() => {
                const width = window.innerWidth;
                const height = window.innerHeight;
                const originX = x ?? width / 2;
                const originY = y ?? height / 2;

                const [startClip, endClip] = getClipPaths(chosenShape, originX, originY, width, height);

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
        [cycleMode, duration, shape]
    );

    return {
        mode,
        activeTheme: toActiveTheme(mode),
        nextMode,
        shape,
        shapes: TRANSITION_SHAPES,
        setMode,
        setShape,
        cycleMode,
        cycleModeAnimated,
    };
};

/**
 * Inline script that runs before React hydrates.
 *
 * Prevents a flash of the wrong theme by applying the saved
 * mode to the page as soon as it loads. Place it in `<head>`.
 */
export const ThemeScript = () => {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
                    (function () {
                        try {
                            const mode = localStorage.getItem('${THEME_STORAGE_KEY}') || '${DEFAULT_MODE}';
                            const prefersDark = window.matchMedia('${DARK_QUERY}').matches;
                            const activeTheme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

                            document.documentElement.setAttribute('data-theme', activeTheme);
                            document.documentElement.classList.toggle('dark', activeTheme === 'dark');
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
