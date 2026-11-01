import type { ColorMode, ColorScheme, ColorSchemeOption, ShapeOption, TransitionShape } from './types';

/* ----------------------------- Storage Keys ------------------------------- */

/** localStorage key for the selected color mode. */
export const MODE_STORAGE_KEY = 'theme';

/** localStorage key for the selected transition shape. */
export const SHAPE_STORAGE_KEY = 'theme-transition-shape';

/** localStorage key for the selected color scheme. */
export const COLOR_SCHEME_STORAGE_KEY = 'color-scheme';

/* ------------------------------ Event Names ------------------------------- */

/** Window event fired when the color mode changes in the current tab. */
export const MODE_CHANGE_EVENT = 'my-music-mode-change';

/** Window event fired when the transition shape changes in the current tab. */
export const SHAPE_CHANGE_EVENT = 'my-music-shape-change';

/** Window event fired when the color scheme changes in the current tab. */
export const COLOR_SCHEME_CHANGE_EVENT = 'my-music-color-scheme-change';

/* -------------------------------- Defaults -------------------------------- */

/** All available color modes supported by the application. */
export const MODES: readonly ColorMode[] = ['light', 'dark', 'system'] as const;

/** Mode used when nothing is saved yet. */
export const DEFAULT_MODE: ColorMode = 'system';

/** Shape used when nothing is saved yet. */
export const DEFAULT_SHAPE: TransitionShape = 'circle';

/** Color scheme used when nothing is saved yet. */
export const DEFAULT_COLOR_SCHEME: ColorScheme = 'cloud';

export const DEFAULT_META_VAR = '--background';

/* ------------------------------- Media Query ------------------------------ */

/** Media query that matches when the OS prefers dark. */
export const DARK_QUERY = '(prefers-color-scheme: dark)';

/* --------------------------- Transition Shapes ---------------------------- */

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

/* ----------------------------- Color Schemes ------------------------------ */

/** All available color scheme descriptors with preview metadata. */
export const COLOR_SCHEMES: readonly ColorSchemeOption[] = [
    {
        id: 'cloud',
        label: 'Cloud',
        description: 'Cool neutral sky',
        swatch: '#7094b8',
        accent: 'oklch(90.5% 0.022 255)',
    },
    {
        id: 'slate',
        label: 'Slate',
        description: 'Deep nautical slate',
        swatch: '#476585',
        accent: 'oklch(88.5% 0.04 250)',
    },
    {
        id: 'stone',
        label: 'Stone',
        description: 'Warm organic travertine',
        swatch: '#94836b',
        accent: 'oklch(90% 0.04 80)',
    },
    {
        id: 'indigo',
        label: 'Indigo',
        description: 'Vibrant modern violet',
        swatch: '#6366f1',
        accent: 'oklch(90% 0.055 285)',
    },
    {
        id: 'graphite',
        label: 'Graphite',
        description: 'Monochrome carbon',
        swatch: '#4b5563',
        accent: 'oklch(85% 0.008 260)',
    },
    {
        id: 'rose',
        label: 'Rose',
        description: 'Soft blush pink',
        swatch: '#db6686',
        accent: 'oklch(90.3% 0.05 5)',
    },
    {
        id: 'crimson',
        label: 'Crimson',
        description: 'Deep ruby red',
        swatch: '#cc2538',
        accent: 'oklch(90.3% 0.05 22)',
    },
    {
        id: 'coral',
        label: 'Coral',
        description: 'Sunset coral glow',
        swatch: '#e96f49',
        accent: 'oklch(90.3% 0.055 38)',
    },
    {
        id: 'ember',
        label: 'Ember',
        description: 'Glowing burnt orange',
        swatch: '#da720d',
        accent: 'oklch(90.3% 0.06 55)',
    },
    {
        id: 'amber',
        label: 'Amber',
        description: 'Golden honey warmth',
        swatch: '#daa932',
        accent: 'oklch(90.3% 0.075 85)',
    },
    {
        id: 'lime',
        label: 'Lime',
        description: 'Zesty fresh chartreuse',
        swatch: '#a5d046',
        accent: 'oklch(90.3% 0.07 125)',
    },
    {
        id: 'sage',
        label: 'Sage',
        description: 'Muted herbal green',
        swatch: '#7da47e',
        accent: 'oklch(90.3% 0.032 145)',
    },
    {
        id: 'forest',
        label: 'Forest',
        description: 'Dense evergreen canopy',
        swatch: '#397852',
        accent: 'oklch(90.3% 0.045 155)',
    },
    {
        id: 'emerald',
        label: 'Emerald',
        description: 'Rich polished jewel green',
        swatch: '#00ad78',
        accent: 'oklch(90.3% 0.055 163)',
    },
    {
        id: 'mint',
        label: 'Mint',
        description: 'Cool crisp spearmint',
        swatch: '#68cdb7',
        accent: 'oklch(90.3% 0.045 178)',
    },
    {
        id: 'teal',
        label: 'Teal',
        description: 'Calm deep teal',
        swatch: '#0f9293',
        accent: 'oklch(90.3% 0.05 195)',
    },
    {
        id: 'lagoon',
        label: 'Lagoon',
        description: 'Tropical shallow water',
        swatch: '#28aac0',
        accent: 'oklch(90.3% 0.055 212)',
    },
    {
        id: 'sky',
        label: 'Sky',
        description: 'Bright open daylight',
        swatch: '#2eabe1',
        accent: 'oklch(90.3% 0.055 232)',
    },
    {
        id: 'cobalt',
        label: 'Cobalt',
        description: 'Saturated electric blue',
        swatch: '#0e6ee6',
        accent: 'oklch(90.3% 0.065 258)',
    },
    {
        id: 'violet',
        label: 'Violet',
        description: 'Royal amethyst purple',
        swatch: '#9253da',
        accent: 'oklch(90.3% 0.06 302)',
    },
    {
        id: 'orchid',
        label: 'Orchid',
        description: 'Playful magenta bloom',
        swatch: '#cc54c5',
        accent: 'oklch(90.3% 0.06 330)',
    },
    {
        id: 'mocha',
        label: 'Mocha',
        description: 'Roasted espresso brown',
        swatch: '#8f6752',
        accent: 'oklch(90.3% 0.035 50)',
    },
    {
        id: 'midnight',
        label: 'Midnight',
        description: 'Deep twilight navy',
        swatch: '#2f4087',
        accent: 'oklch(90.3% 0.065 270)',
    },
] as const;

/** Array of all available color scheme identifiers in display order. */
export const COLOR_SCHEME_IDS: readonly ColorScheme[] = COLOR_SCHEMES.map((scheme) => scheme.id);

/* --------------------------------- Helpers -------------------------------- */

/**
 * Returns the next element in a circular list, wrapping around to the first element
 * after reaching the end. If the current element is not found, returns the first element.
 *
 * @param items - The readonly array of items.
 * @param current - The current active item.
 * @returns The next item in circular order.
 */
export function getNextItem<T>(items: readonly T[], current: T): T {
    if (items.length === 0) return current;
    const currentIndex = items.indexOf(current);
    if (currentIndex === -1) {
        return items[0] as T;
    }
    return items[(currentIndex + 1) % items.length] as T;
}
