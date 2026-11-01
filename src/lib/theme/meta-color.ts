import { isBrowser } from '@/lib/storage';

import { DEFAULT_META_VAR } from './constants';

/**
 * Resolves a CSS custom property value, unpacking nested `var(...)` references
 * if necessary so that a valid CSS color string is returned.
 *
 * @param varName - The CSS custom property name (e.g. `--background`).
 * @param maxDepth - Maximum recursion depth to prevent circular reference loops.
 * @returns The resolved color string, or empty string if not found.
 */
function resolveCssColor(varName: string, maxDepth = 5): string {
    if (maxDepth <= 0) return '';
    const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (raw.startsWith('var(')) {
        const innerVar = raw.slice(4, -1).trim();
        return resolveCssColor(innerVar, maxDepth - 1);
    }
    return raw;
}

/**
 * Sets the `<meta name="theme-color">` content in `<head>`, removing any
 * conflicting `media` attributes and extra viewport tags so the active theme takes effect.
 *
 * @param color - The resolved CSS color string.
 */
export function setMetaThemeColor(color: string): void {
    if (!isBrowser || !color) return;

    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    if (metaTags.length > 0) {
        metaTags[0].removeAttribute('media');
        metaTags[0].setAttribute('content', color);
        for (let i = 1; i < metaTags.length; i++) {
            metaTags[i].remove();
        }
    } else {
        const metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'theme-color');
        metaTag.setAttribute('content', color);
        document.head.appendChild(metaTag);
    }
}

/**
 * Updates the `<meta name="theme-color">` tag in the `<head>` using `DEFAULT_META_VAR`.
 */
export function updateMetaColor(): void {
    if (!isBrowser) return;
    const color = resolveCssColor(DEFAULT_META_VAR);
    setMetaThemeColor(color);
}
