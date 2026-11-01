/**
 * Safe client-side storage and external store event utilities.
 * Handles server-side rendering, private browsing modes, quota errors,
 * and security policy restrictions gracefully with try/catch guards.
 */

/* --------------------------------- Guards --------------------------------- */

/** `true` when running in a browser environment with an active DOM document. */
export const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/* -------------------------------- Storage --------------------------------- */

/**
 * Safely reads a string value from localStorage.
 *
 * @param key - The storage key to read.
 * @returns The stored string, or `null` if missing, running on server, or access fails.
 */
export function safeGetItem(key: string): string | null {
    if (!isBrowser) return null;

    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

/**
 * Safely writes a string value to localStorage.
 *
 * @param key - The storage key to write.
 * @param value - The value to store.
 * @returns `true` if the write succeeded, `false` otherwise.
 */
export function safeSetItem(key: string, value: string): boolean {
    if (!isBrowser) return false;

    try {
        localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

/**
 * Safely removes an item from localStorage.
 *
 * @param key - The storage key to remove.
 * @returns `true` if removal succeeded, `false` otherwise.
 */
export function safeRemoveItem(key: string): boolean {
    if (!isBrowser) return false;

    try {
        localStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
}

/**
 * Safely reads and parses a JSON value from localStorage.
 *
 * @param key - The storage key to read.
 * @param fallback - Default value if key is not found or parsing fails.
 * @returns The parsed data or fallback.
 */
export function safeGetJSON<T>(key: string, fallback: T): T {
    const raw = safeGetItem(key);
    if (raw === null) return fallback;

    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

/**
 * Safely serializes and writes a JSON value to localStorage.
 *
 * @param key - The storage key to write.
 * @param value - The value to serialize and store.
 * @returns `true` if writing succeeded, `false` otherwise.
 */
export function safeSetJSON<T>(key: string, value: T): boolean {
    try {
        return safeSetItem(key, JSON.stringify(value));
    } catch {
        return false;
    }
}

/**
 * Safely reads a value from localStorage and validates it using a type guard.
 * Returns the fallback value if the key does not exist or validation fails.
 *
 * @param key - The localStorage key to read.
 * @param isValid - Type guard predicate validating the stored value.
 * @param fallback - Default value if not found or invalid.
 * @returns The validated value or fallback.
 */
export function getSavedItem<T extends string>(key: string, isValid: (value: unknown) => value is T, fallback: T): T {
    const saved = safeGetItem(key);
    if (isValid(saved)) return saved;

    return fallback;
}

/* --------------------------------- Events --------------------------------- */

/**
 * Safely dispatches a custom event on the window in a browser environment.
 *
 * @param eventName - The CustomEvent name to dispatch.
 * @param detail - Optional detail payload.
 */
export function dispatchStorageEvent<T>(eventName: string, detail?: T): void {
    if (!isBrowser) return;

    window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/* ------------------------------ Subscriptions ----------------------------- */

/**
 * Subscribes to changes for a specific localStorage key and its corresponding
 * window CustomEvent. Handles cross-tab `storage` events and intra-tab custom events.
 *
 * @param storageKey - The localStorage key to monitor.
 * @param eventName - The CustomEvent name dispatched on the window.
 * @param onChange - Callback invoked when the value changes.
 * @returns An unsubscribe cleanup function.
 */
export function subscribeToStorage(storageKey: string, eventName: string, onChange: () => void): () => void {
    if (!isBrowser) return () => undefined;

    const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === storageKey) {
            onChange();
        }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(eventName, onChange);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(eventName, onChange);
    };
}
