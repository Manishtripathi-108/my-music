import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import 'server-only';

import type { AudioTags, WriteAudioTags } from '@/lib/media';

import type { RawPictureData } from '../types';
import { TagMapper } from './tag-mapper';

export interface NodeTagLib2RawPicture {
    mimetype: string;
    picture: Buffer;
}

export interface NodeTagLib2Tags {
    title?: string;
    artist?: string;
    album?: string;
    comment?: string;
    genre?: string;
    year?: number;
    track?: number;
    albumartist?: string;
    discnumber?: string;
    tracknumber?: string;
    composer?: string;
    bpm?: number;
    compilation?: string;
    id?: string;
    pictures?: NodeTagLib2RawPicture[];
    bitrate?: number;
    samplerate?: number;
    channels?: number;
    length?: number;
}

export interface NodeTagLib2Binding {
    readTagsSync(filePath: string): NodeTagLib2Tags;
    writeTagsSync(filePath: string, tags: Record<string, unknown>): boolean;
}

let bindingCache: NodeTagLib2Binding | null | undefined = undefined;

/**
 * Dynamically resolves optional runtime-only native modules relative to project root.
 * Using createRequire with dynamic string targets prevents Turbopack/Webpack from
 * emitting build-time "Module not found" warnings when optional modules are not installed.
 */
function dynamicRequire<T = unknown>(target: string): T | null {
    try {
        const req = createRequire(path.resolve(process.cwd(), 'package.json'));
        return req(target) as T;
    } catch {
        return null;
    }
}

/**
 * Safely resolves and loads the native node-taglib2 binding.
 * Tries 'taglib2' (official package name for voltraco/node-taglib2)
 * and 'node-taglib2' aliases.
 */
function loadBinding(): NodeTagLib2Binding | null {
    if (bindingCache !== undefined) {
        return bindingCache;
    }

    const candidate = dynamicRequire<NodeTagLib2Binding>('taglib2') ?? dynamicRequire<NodeTagLib2Binding>('node-taglib2');

    bindingCache = candidate ?? null;
    return bindingCache;
}

/**
 * Native audio metadata adapter backed by voltraco/node-taglib2.
 * Executes native TagLib C++ bindings in-process without spawning subprocesses.
 */
export class NodeTagLib2Adapter {
    /**
     * Checks if the voltraco/node-taglib2 native module is available and functional.
     */
    public static isAvailable(): boolean {
        const binding = loadBinding();
        return Boolean(binding && typeof binding.readTagsSync === 'function' && typeof binding.writeTagsSync === 'function');
    }

    /**
     * Retrieves version descriptor for node-taglib2 if available.
     */
    public static getVersion(): string | null {
        if (!NodeTagLib2Adapter.isAvailable()) return null;

        const pkg = dynamicRequire<{ version?: string }>('taglib2/package.json') ?? dynamicRequire<{ version?: string }>('node-taglib2/package.json');

        return pkg?.version ?? '2.9.6 (node-taglib2)';
    }

    /**
     * Reads all normalized tags and embedded cover art from an audio file via node-taglib2.
     */
    public readTags(canonicalPath: string): {
        tags: AudioTags;
        raw: Record<string, unknown>;
        artwork: RawPictureData | null;
    } {
        const binding = loadBinding();
        if (!binding) {
            throw new Error('node-taglib2 native binding is not available in current runtime');
        }

        const rawData = binding.readTagsSync(canonicalPath);
        if (!rawData || typeof rawData !== 'object') {
            throw new Error(`node-taglib2 returned empty or invalid metadata for: ${canonicalPath}`);
        }

        const propMap: Record<string, string[]> = {};
        if (rawData.title) propMap.TITLE = [rawData.title];
        if (rawData.artist) propMap.ARTIST = [rawData.artist];
        if (rawData.album) propMap.ALBUM = [rawData.album];
        if (rawData.comment) propMap.COMMENT = [rawData.comment];
        if (rawData.genre) propMap.GENRE = [rawData.genre];
        if (rawData.year !== undefined && rawData.year > 0) propMap.DATE = [String(rawData.year)];
        if (rawData.track !== undefined && rawData.track > 0) propMap.TRACKNUMBER = [String(rawData.track)];
        if (rawData.tracknumber) propMap.TRACKNUMBER = [rawData.tracknumber];
        if (rawData.albumartist) propMap.ALBUMARTIST = [rawData.albumartist];
        if (rawData.discnumber) propMap.DISCNUMBER = [rawData.discnumber];
        if (rawData.composer) propMap.COMPOSER = [rawData.composer];
        if (rawData.bpm !== undefined && rawData.bpm > 0) propMap.BPM = [String(rawData.bpm)];
        if (rawData.compilation) propMap.COMPILATION = [rawData.compilation];
        if (rawData.id) propMap.ID = [rawData.id];

        const tags = TagMapper.fromTagLibProperties(propMap);

        const primaryPic = rawData.pictures && rawData.pictures.length > 0 ? rawData.pictures[0] : null;
        const artwork: RawPictureData | null =
            primaryPic && primaryPic.picture
                ? {
                      data: Buffer.from(primaryPic.picture),
                      mimeType: primaryPic.mimetype || 'image/jpeg',
                  }
                : null;

        return { tags, raw: rawData as unknown as Record<string, unknown>, artwork };
    }

    /**
     * Extracts embedded artwork from an audio file via node-taglib2.
     */
    public readArtwork(canonicalPath: string): RawPictureData | null {
        const binding = loadBinding();
        if (!binding) return null;

        try {
            const rawData = binding.readTagsSync(canonicalPath);
            const primaryPic = rawData.pictures && rawData.pictures.length > 0 ? rawData.pictures[0] : null;
            if (!primaryPic?.picture) return null;

            return {
                data: Buffer.from(primaryPic.picture),
                mimeType: primaryPic.mimetype || 'image/jpeg',
            };
        } catch {
            return null;
        }
    }

    /**
     * Writes metadata tags atomically via node-taglib2.
     */
    public async writeTags(canonicalPath: string, tags: WriteAudioTags): Promise<void> {
        const binding = loadBinding();
        if (!binding) {
            throw new Error('node-taglib2 native binding is not available in current runtime');
        }

        const payload: Record<string, unknown> = {};
        if (tags.title !== undefined) payload.title = tags.title ?? '';
        if (tags.artists !== undefined) payload.artist = tags.artists ? tags.artists.join(', ') : '';
        if (tags.album !== undefined) payload.album = tags.album ?? '';
        if (tags.comment !== undefined) payload.comment = tags.comment ?? '';
        if (tags.genres !== undefined) payload.genre = tags.genres ? tags.genres.join(', ') : '';
        if (tags.year !== undefined) payload.year = tags.year ?? 0;
        if (tags.trackNumber !== undefined) {
            payload.track = tags.trackNumber ?? 0;
            if (tags.trackTotal) {
                payload.tracknumber = `${tags.trackNumber}/${tags.trackTotal}`;
            } else if (tags.trackNumber) {
                payload.tracknumber = String(tags.trackNumber);
            }
        }
        if (tags.albumArtists !== undefined) payload.albumartist = tags.albumArtists ? tags.albumArtists.join(', ') : '';
        if (tags.discNumber !== undefined) {
            if (tags.discTotal) {
                payload.discnumber = `${tags.discNumber}/${tags.discTotal}`;
            } else if (tags.discNumber) {
                payload.discnumber = String(tags.discNumber);
            }
        }
        if (tags.composers !== undefined) payload.composer = tags.composers ? tags.composers.join(', ') : '';
        if (tags.bpm !== undefined) payload.bpm = tags.bpm ? String(tags.bpm) : '';

        await this.atomicWriteWithBinding(canonicalPath, (tempPath) => {
            const ok = binding.writeTagsSync(tempPath, payload);
            if (!ok) {
                throw new Error(`node-taglib2 writeTagsSync failed for: ${canonicalPath}`);
            }
        });
    }

    /**
     * Embeds an image buffer as primary FrontCover artwork via node-taglib2.
     */
    public async embedArtwork(canonicalPath: string, imageBuffer: Buffer, mimeType = 'image/jpeg'): Promise<void> {
        const binding = loadBinding();
        if (!binding) {
            throw new Error('node-taglib2 native binding is not available in current runtime');
        }

        const payload = {
            pictures: [
                {
                    mimetype: mimeType,
                    picture: imageBuffer,
                },
            ],
        };

        await this.atomicWriteWithBinding(canonicalPath, (tempPath) => {
            const ok = binding.writeTagsSync(tempPath, payload);
            if (!ok) {
                throw new Error(`node-taglib2 failed to embed artwork for: ${canonicalPath}`);
            }
        });
    }

    /**
     * Clears all embedded cover art from an audio file via node-taglib2.
     */
    public async removeArtwork(canonicalPath: string): Promise<void> {
        const binding = loadBinding();
        if (!binding) {
            throw new Error('node-taglib2 native binding is not available in current runtime');
        }

        const payload = {
            pictures: [],
        };

        await this.atomicWriteWithBinding(canonicalPath, (tempPath) => {
            const ok = binding.writeTagsSync(tempPath, payload);
            if (!ok) {
                throw new Error(`node-taglib2 failed to remove artwork for: ${canonicalPath}`);
            }
        });
    }

    /**
     * Crash-safe atomic write helper:
     * Copies target to a temporary sibling file, executes the synchronous native write,
     * flushes to disk with fsync, restores file timestamps, and atomically renames.
     */
    private async atomicWriteWithBinding(canonicalPath: string, writeFn: (tempPath: string) => void): Promise<void> {
        const dir = path.dirname(canonicalPath);
        const base = path.basename(canonicalPath);
        const tempPath = path.join(dir, `.${base}.tmp_${crypto.randomUUID().slice(0, 8)}`);

        await fs.promises.copyFile(canonicalPath, tempPath);
        const stats = await fs.promises.stat(canonicalPath).catch(() => null);

        try {
            writeFn(tempPath);

            const handle = await fs.promises.open(tempPath, 'r');
            try {
                await handle.sync();
            } finally {
                await handle.close();
            }

            if (stats) {
                await fs.promises.utimes(tempPath, stats.atime, stats.mtime).catch(() => {});
            }

            await fs.promises.rename(tempPath, canonicalPath);

            if (stats) {
                await fs.promises.utimes(canonicalPath, stats.atime, stats.mtime).catch(() => {});
            }
        } catch (err) {
            await fs.promises.unlink(tempPath).catch(() => {});
            throw err;
        }
    }
}
