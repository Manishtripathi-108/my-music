'use client';

import { COLOR_SCHEME_STORAGE_KEY, DARK_QUERY, DEFAULT_COLOR_SCHEME, DEFAULT_MODE, MODE_STORAGE_KEY } from '@/lib/theme/constants';

/* --------------------------- Theme Script Component ----------------------- */

/**
 * Inline script that runs before React hydrates.
 *
 * Prevents a flash of the wrong theme or color scheme by applying the saved
 * mode and color scheme to the root document element immediately. Place it in `<head>`.
 */
export const ThemeScript = () => {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
                    (function () {
                        try {
                            const mode = localStorage.getItem('${MODE_STORAGE_KEY}') || '${DEFAULT_MODE}';
                            const prefersDark = window.matchMedia('${DARK_QUERY}').matches;
                            const isDark = mode === 'dark' || (mode === 'system' && prefersDark);

                            document.documentElement.classList.toggle('dark', isDark);

                            const scheme = localStorage.getItem('${COLOR_SCHEME_STORAGE_KEY}') || '${DEFAULT_COLOR_SCHEME}';
                            document.documentElement.setAttribute('data-theme', scheme);
                        } catch (e) {
                            console.error("Error applying theme:", e);
                        }
                    })();
                `,
            }}
        />
    );
};

export default ThemeScript;
