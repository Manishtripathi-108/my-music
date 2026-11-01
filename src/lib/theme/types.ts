/* ---------------------------------- Types --------------------------------- */

/** The mode the user picked. `'system'` follows the OS setting. */
export type ColorMode = 'light' | 'dark' | 'system';

/** The mode actually shown on screen (`'system'` already resolved). */
export type ActiveMode = 'light' | 'dark';

/**
 * Shape of the reveal animation played when the color mode changes.
 * Each shape produces a different clip-path expansion from the click origin.
 */
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

/** Options accepted by {@link useTheme}. */
export interface UseThemeOptions {
    /** Animation length in milliseconds. Defaults to `450`. */
    duration?: number;
}

/** Sets a mode directly, or computes it from the current one. */
export type SetMode = (value: ColorMode | ((current: ColorMode) => ColorMode)) => void;

/**
 * Valid color scheme identifiers defined in CSS via `:root[data-theme='...']`.
 *
 * Each scheme maps to a full set of OKLCH surface, brand, and semantic tokens
 * that propagate across every component, elevation, and interactive control.
 */
export type ColorScheme =
    | 'cloud'
    | 'slate'
    | 'stone'
    | 'indigo'
    | 'graphite'
    | 'rose'
    | 'crimson'
    | 'coral'
    | 'ember'
    | 'amber'
    | 'lime'
    | 'sage'
    | 'forest'
    | 'emerald'
    | 'mint'
    | 'teal'
    | 'lagoon'
    | 'sky'
    | 'cobalt'
    | 'violet'
    | 'orchid'
    | 'mocha'
    | 'midnight';

/** Metadata descriptor for a color scheme option. */
export interface ColorSchemeOption {
    /** Unique scheme identifier applied to the `data-theme` DOM attribute. */
    id: ColorScheme;
    /** Human-readable display label. */
    label: string;
    /** Short mood or architectural description. */
    description: string;
    /** Hex color preview swatch for UI pickers. */
    swatch: string;
    /** OKLCH accent color string for live previews. */
    accent: string;
}

/** Value returned by the unified {@link useTheme} hook. */
export interface UseThemeReturn {
    /** The mode the user picked (`'light'`, `'dark'` or `'system'`). */
    mode: ColorMode;
    /** The mode currently shown on screen (`'light'` or `'dark'`). */
    activeMode: ActiveMode;
    /** The mode that comes after the current one when cycling. */
    nextMode: ColorMode;
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
    /** Jump to the next mode with a reveal animation. */
    setModeAnimated: (newMode: ColorMode, x?: number, y?: number, shapeOverride?: TransitionShape) => void;
    /**
     * Jump to the next mode with a reveal animation.
     * Falls back to {@link UseThemeReturn.cycleMode} if the View Transition API is missing.
     *
     * @param x - Animation start X in px. Defaults to screen center.
     * @param y - Animation start Y in px. Defaults to screen center.
     * @param shapeOverride - Use this shape once instead of the saved one.
     */
    cycleModeAnimated: (x?: number, y?: number, shapeOverride?: TransitionShape) => void;
    /** The currently active color scheme identifier. */
    colorScheme: ColorScheme;
    /** Change the active color scheme. */
    setColorScheme: (scheme: ColorScheme) => void;
    /** Sequentially cycle to the next available color scheme. */
    cycleColorScheme: () => void;
    /** All available color scheme configurations. */
    colorSchemes: readonly ColorSchemeOption[];
    /** All available color modes ('light', 'dark', 'system'). */
    modes: readonly ColorMode[];
}
