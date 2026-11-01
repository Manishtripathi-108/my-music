import type { TransitionShape } from './types';

/** Clip path that covers the whole screen. Used as the end state of wipe animations. */
const FULL_SCREEN_CLIP = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

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
export const getClipPaths = (shape: TransitionShape, x: number, y: number, width: number, height: number): [string, string] => {
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
            const half = Math.max(x, width - x, y, height - y) * 1.45;
            return [
                collapsed(4),
                `polygon(${x - half}px ${y - half}px, ${x + half}px ${y - half}px, ${x + half}px ${y + half}px, ${x - half}px ${y + half}px)`,
            ];
        }

        case 'star': {
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
