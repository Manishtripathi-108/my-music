'use client';

/* --------------------------- Theme Script Component ----------------------- */

const THEME_STORAGE_KEY = 'theme';
const DEFAULT_MODE = 'system';
const DARK_QUERY = '(prefers-color-scheme: dark)';

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

export default ThemeScript;
