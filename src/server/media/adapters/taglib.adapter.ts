import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import 'server-only';
import { applyCoverArt, applyTags, clearPictures, readMetadata, readPictures } from 'taglib-wasm/simple';

import { serverEnv } from '@/config/env.server';

import { type ToolHealth, inspectNativeTool, resolveActiveEngine, toolHealthStatus } from '../tool-inspector';
import type { RawPictureData, TagWriteOptions, TagWriteResult } from '../types';
import { TagMapper } from './tag-mapper';
import type { AudioTags, WriteAudioTags } from '@/lib/media';

const execFileAsync = promisify(execFile);

function parseTagLibVersion(output: string): string | null {
    try {
        const parsed: unknown = JSON.parse(output);

        if (typeof parsed === 'object' && parsed !== null && 'taglibVersion' in parsed) {
            const v = (parsed as { taglibVersion?: unknown }).taglibVersion;
            return typeof v === 'string' ? v : null;
        }
    } catch {
        // not JSON — ignore
    }

    return null;
}

function resolveWorkerPath(configuredPath: string | undefined): string | null {
    if (!configuredPath) return null;
    const trimmed = configuredPath.trim();
    if (!trimmed) return null;
    return path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed);
}

/**
 * Resilient JSON parser for native worker stdout.
 * If standard JSON.parse fails due to unescaped control characters within string literals
 * (e.g. multiline lyrics or comments), sanitizes raw newlines and control codes in strings.
 */
function safeParseWorkerJson<T = unknown>(raw: string): T {
    try {
        return JSON.parse(raw) as T;
    } catch {
        let inString = false;
        let escaped = false;
        let sanitized = '';

        for (let i = 0; i < raw.length; i++) {
            const char = raw[i];

            if (char === '"' && !escaped) {
                inString = !inString;
                sanitized += char;
            } else if (inString) {
                if (char === '\n') {
                    sanitized += '\\n';
                } else if (char === '\r') {
                    sanitized += '\\r';
                } else if (char === '\t') {
                    sanitized += '\\t';
                } else if (char.charCodeAt(0) < 0x20) {
                    sanitized += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
                } else {
                    sanitized += char;
                }
            } else {
                sanitized += char;
            }

            escaped = char === '\\' && !escaped;
        }

        return JSON.parse(sanitized) as T;
    }
}

/**
 * Universal Audio Metadata Adapter powered by TagLib 2.x.
 * Executes in-process via WebAssembly (taglib-wasm) or via native worker sidecar.
 * Guarantees zero audio re-encoding, padding preservation, and atomic crash-safe writes.
 */
export class TagLibAdapter {
    /**
     * Returns health diagnostics for this adapter: configured vs active engine
     * and both native/WASM implementation statuses.
     */
    public static async getToolHealth(): Promise<ToolHealth> {
        const workerPath = resolveWorkerPath(serverEnv.TAGLIB_WORKER_PATH);
        const native = await inspectNativeTool('taglib', workerPath, ['--version'], parseTagLibVersion);

        const configured = serverEnv.METADATA_ENGINE;
        const active = resolveActiveEngine(configured, native.available, true);

        return {
            configured,
            active,
            implementations: {
                native,
                wasm: { available: true },
            },
            status: toolHealthStatus(configured, active, native.available, true),
        };
    }

    /**
     * Reads all normalized tags and embedded cover art from an audio file.
     *
     * What is happening:
     * 1. Attempts to read metadata via TagLib native worker sidecar if configured and available.
     * 2. Falls back to in-process WebAssembly (`taglib-wasm`), reading the file buffer into memory.
     * 3. Extracts raw properties and cover pictures (prioritizing FrontCover).
     * 4. Translates raw TagLib properties into the normalized AudioTags domain model via TagMapper.
     *
     * @param canonicalPath - Pre-authorized canonical absolute file path.
     * @returns Fully normalized AudioTags, raw properties dictionary, and primary artwork picture.
     */
    public async readTags(canonicalPath: string): Promise<{
        tags: AudioTags;
        raw: Record<string, unknown>;
        artwork: RawPictureData | null;
    }> {
        const configured = serverEnv.METADATA_ENGINE;
        const workerPath = resolveWorkerPath(serverEnv.TAGLIB_WORKER_PATH);
        const useNative = configured === 'native' && Boolean(workerPath);

        if (useNative && workerPath) {
            try {
                const { stdout } = await execFileAsync(workerPath, ['--read', canonicalPath]);
                const parsed = safeParseWorkerJson<{ success?: boolean; properties?: Record<string, unknown> }>(stdout);

                if (parsed.success && parsed.properties) {
                    const raw = parsed.properties;
                    const tags = TagMapper.fromTagLibProperties(raw);
                    return { tags, raw, artwork: null };
                }
            } catch (error) {
                console.warn(
                    '[TagLibAdapter] Native worker failed to read tags, falling back to WASM:',
                    error instanceof Error ? error.message : error
                );
            }
        }

        const fileBuffer = await fs.promises.readFile(canonicalPath);

        const [metadata, pictures] = await Promise.all([readMetadata(fileBuffer).catch(() => null), readPictures(fileBuffer).catch(() => [])]);

        const raw = {
            ...((metadata?.properties as unknown as Record<string, unknown>) ?? {}),
            ...((metadata?.tags as unknown as Record<string, unknown>) ?? {}),
        };
        const tags = TagMapper.fromTagLibProperties(raw);

        const primaryPicture = pictures && pictures.length > 0 ? (pictures.find((p) => p.type === 'FrontCover') ?? pictures[0]) : null;

        const artwork: RawPictureData | null = primaryPicture
            ? {
                  data: Buffer.from(primaryPicture.data),
                  mimeType: primaryPicture.mimeType || 'image/jpeg',
                  description: primaryPicture.description,
              }
            : null;

        return { tags, raw, artwork };
    }

    /**
     * Extracts embedded artwork from an audio file via TagLib WASM.
     */
    public async readArtwork(canonicalPath: string): Promise<RawPictureData | null> {
        try {
            const fileBuffer = await fs.promises.readFile(canonicalPath);
            const pictures = await readPictures(fileBuffer);
            if (!pictures || pictures.length === 0) return null;

            const primary = pictures.find((p) => p.type === 'FrontCover') ?? pictures[0];
            return {
                data: Buffer.from(primary.data),
                mimeType: primary.mimeType || 'image/jpeg',
                description: primary.description,
            };
        } catch {
            return null;
        }
    }

    /**
     * Updates metadata tags on an audio file without re-encoding audio bitstreams.
     *
     * What is happening:
     * 1. Creates a hardlink or copy backup (`<file>_original`) if `options.preserveOriginal` is true.
     * 2. Computes the deterministic TagLibWritePlan and flat property map via TagMapper.
     * 3. Erases removed properties (`[]`) and updates set properties using TagLib in-place padding writes.
     * 4. Writes the updated buffer to a temporary sibling file (`.<file>.tmp_<uuid>`), flushes with fsync,
     *    restores atime/mtime timestamps, and atomically renames over the destination path.
     *
     * @param canonicalPath - Pre-authorized canonical absolute file path.
     * @param tags - Validated canonical WriteAudioTags model.
     * @param options - Tag write options (e.g. backup preservation).
     * @returns Result indicating final file path and optional backup path.
     *
     * @example
     * // Input path and write patch:
     * const patch = {
     *     title: 'Kashmir (2015 Remaster)',
     *     rating: 95,
     *     lyrics: null, // delete lyrics
     * };
     * const result = await adapter.writeTags(
     *     '/music/led_zeppelin/kashmir.flac',
     *     patch,
     *     { preserveOriginal: true }
     * );
     *
     * // Desired Result:
     * // {
     * //     filePath: '/music/led_zeppelin/kashmir.flac',
     * //     backupPath: '/music/led_zeppelin/kashmir.flac_original',
     * // }
     */
    public async writeTags(canonicalPath: string, tags: WriteAudioTags, options: TagWriteOptions = {}): Promise<TagWriteResult> {
        let backupPath: string | undefined;

        if (options.preserveOriginal) {
            backupPath = `${canonicalPath}_original`;
            try {
                await fs.promises.link(canonicalPath, backupPath);
            } catch {
                await fs.promises.copyFile(canonicalPath, backupPath);
            }
        }

        const fileBuffer = await fs.promises.readFile(canonicalPath);
        const plan = TagMapper.toTagLibProperties(tags);
        console.log('🪵 > taglib.adapter.ts:195 > TagLibAdapter > writeTags > tags:', tags)
        console.log('🪵 > taglib.adapter.ts:195 > TagLibAdapter > writeTags > plan:', plan)

        // TagLib client write boundary:
        // - Empty string list values ([]): translated to property removal / erase
        // - Non-empty string list values: translated to property replacement
        const updatedBuffer = await applyTags(fileBuffer, plan);
        await this.atomicWriteFile(canonicalPath, Buffer.from(updatedBuffer));

        return { filePath: canonicalPath, backupPath };
    }

    /**
     * Embeds an image buffer as primary FrontCover artwork into an audio file.
     */
    public async embedArtwork(
        canonicalPath: string,
        imageBuffer: Buffer,
        mimeType = 'image/jpeg',
        options: TagWriteOptions = {}
    ): Promise<TagWriteResult> {
        let backupPath: string | undefined;

        if (options.preserveOriginal) {
            backupPath = `${canonicalPath}_original`;
            try {
                await fs.promises.link(canonicalPath, backupPath);
            } catch {
                await fs.promises.copyFile(canonicalPath, backupPath);
            }
        }

        const fileBuffer = await fs.promises.readFile(canonicalPath);
        const updatedBuffer = await applyCoverArt(fileBuffer, imageBuffer, mimeType);
        await this.atomicWriteFile(canonicalPath, Buffer.from(updatedBuffer));

        return { filePath: canonicalPath, backupPath };
    }

    /**
     * Clears all embedded cover art from an audio file.
     */
    public async removeArtwork(canonicalPath: string, options: TagWriteOptions = {}): Promise<TagWriteResult> {
        let backupPath: string | undefined;

        if (options.preserveOriginal) {
            backupPath = `${canonicalPath}_original`;
            try {
                await fs.promises.link(canonicalPath, backupPath);
            } catch {
                await fs.promises.copyFile(canonicalPath, backupPath);
            }
        }

        const fileBuffer = await fs.promises.readFile(canonicalPath);
        const updatedBuffer = await clearPictures(fileBuffer);
        await this.atomicWriteFile(canonicalPath, Buffer.from(updatedBuffer));

        return { filePath: canonicalPath, backupPath };
    }

    /**
     * Writes buffer to temporary sibling file, flushes to disk, and atomically renames.
     */
    private async atomicWriteFile(targetPath: string, buffer: Buffer): Promise<void> {
        const dir = path.dirname(targetPath);
        const base = path.basename(targetPath);
        const tempPath = path.join(dir, `.${base}.tmp_${crypto.randomUUID().slice(0, 8)}`);

        const handle = await fs.promises.open(tempPath, 'w');
        try {
            await handle.write(buffer);
            await handle.sync();
        } finally {
            await handle.close();
        }

        const stats = await fs.promises.stat(targetPath).catch(() => null);
        if (stats) {
            await fs.promises.utimes(tempPath, stats.atime, stats.mtime).catch(() => {});
        }

        await fs.promises.rename(tempPath, targetPath);
        if (stats) {
            await fs.promises.utimes(targetPath, stats.atime, stats.mtime).catch(() => {});
        }
    }
}
