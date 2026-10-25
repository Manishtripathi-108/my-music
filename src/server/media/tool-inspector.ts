import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import 'server-only';

const execFileAsync = promisify(execFile);

const TIMEOUT_MS = 3_000;
const MAX_OUTPUT_BYTES = 1024 * 1024;
const CACHE_TTL_MS = 30_000;

export type Engine = 'native' | 'wasm';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface NativeToolHealth {
    available: boolean;
    version: string | null;
    path: string | null;
}

export interface WasmToolHealth {
    available: boolean;
}

export interface ImplementationHealth {
    native: NativeToolHealth;
    wasm: WasmToolHealth;
}

export interface ToolHealth {
    configured: Engine;
    active: Engine;
    implementations: ImplementationHealth;
    /** Health status of this specific tool. */
    status: HealthStatus;
}

export interface EngineHealth {
    status: HealthStatus;
}

export type VersionParser = (output: string) => string | null;

interface CachedEntry {
    checkedAt: number;
    result: NativeToolHealth;
}

const cache = new Map<string, CachedEntry>();
const inFlight = new Map<string, Promise<NativeToolHealth>>();

/**
 * Inspects a native binary by running its version command.
 *
 * Results are cached for CACHE_TTL_MS to avoid repeated subprocess launches
 * during health checks while still recovering from transient failures.
 */
export async function inspectNativeTool(
    cacheKey: string,
    executablePath: string | null | undefined,
    args: string[],
    parseVersion: VersionParser
): Promise<NativeToolHealth> {
    const resolvedPath = executablePath?.trim() || null;

    if (!resolvedPath) {
        return { available: false, version: null, path: null };
    }

    const key = `${cacheKey}:${resolvedPath}`;
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && now - cached.checkedAt < CACHE_TTL_MS) {
        return cached.result;
    }

    const existing = inFlight.get(key);
    if (existing) return existing;

    const promise = runInspection(resolvedPath, args, parseVersion);
    inFlight.set(key, promise);

    try {
        const result = await promise;
        cache.set(key, { checkedAt: Date.now(), result });
        return result;
    } finally {
        inFlight.delete(key);
    }
}

async function runInspection(executablePath: string, args: string[], parseVersion: VersionParser): Promise<NativeToolHealth> {
    try {
        const { stdout, stderr } = await execFileAsync(executablePath, args, {
            timeout: TIMEOUT_MS,
            windowsHide: true,
            maxBuffer: MAX_OUTPUT_BYTES,
        });

        const output = `${stdout}\n${stderr}`.trim();

        return {
            available: true,
            version: parseVersion(output),
            path: executablePath,
        };
    } catch {
        return { available: false, version: null, path: executablePath };
    }
}

/**
 * Resolves which engine is active given the configured preference and availability.
 *
 * Prefers the configured engine; falls back to the other if unavailable.
 */
export function resolveActiveEngine(configured: Engine, nativeAvailable: boolean, wasmAvailable: boolean): Engine {
    if (configured === 'native') {
        return nativeAvailable ? 'native' : wasmAvailable ? 'wasm' : 'native';
    }

    return wasmAvailable ? 'wasm' : nativeAvailable ? 'native' : 'wasm';
}

/**
 * Returns the health status for a single tool.
 */
export function toolHealthStatus(configured: Engine, active: Engine, nativeAvailable: boolean, wasmAvailable: boolean): HealthStatus {
    const activeAvailable = active === 'native' ? nativeAvailable : wasmAvailable;

    if (!activeAvailable) return 'unhealthy';

    return configured === active ? 'healthy' : 'degraded';
}

/**
 * Combines multiple health statuses into one; worst wins.
 */
export function mergeHealthStatus(statuses: readonly HealthStatus[]): HealthStatus {
    if (statuses.includes('unhealthy')) return 'unhealthy';
    if (statuses.includes('degraded')) return 'degraded';
    return 'healthy';
}
