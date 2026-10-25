import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import 'server-only';
import sharp from 'sharp';

import { serverEnv } from '@/config/env.server';
import type { WriteAudioTags } from '@/lib/media';
import { BadRequestError } from '@/server/api';

import { FFprobeAdapter } from './adapters/ffprobe.adapter';
import { MediaInfoAdapter } from './adapters/mediainfo.adapter';
import { TagLibAdapter } from './adapters/taglib.adapter';
import { authorizeInputPath } from './path-security';
import type {
    BatchTagWriteFailure,
    BatchTagWriteResult,
    CombinedAudioMetadata,
    ExtractedArtwork,
    ReadAudioOptions,
    TagWriteOptions,
    TagWriteResult,
} from './types';

/**
 * Uses sharp to safely inspect image buffer dimensions and MIME type.
 */
async function getImageMetadata(buffer: Buffer): Promise<{ width?: number; height?: number; mimeType: string }> {
    try {
        const meta = await sharp(buffer).metadata();
        const format = meta.format;
        const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
        return {
            width: meta.width,
            height: meta.height,
            mimeType,
        };
    } catch {
        return { mimeType: 'image/jpeg' };
    }
}

/**
 * Single Application-Level Metadata & Artwork Orchestrator.
 * Merges TagLib tags, FFprobe elementary streams, optional MediaInfo QC,
 * and artwork caching into unified models.
 */
export class MetadataCoordinator {
    private readonly taglib: TagLibAdapter;
    private readonly ffprobe: FFprobeAdapter;
    private readonly mediaInfo: MediaInfoAdapter;
    private readonly cacheDir: string;
    private readonly activeExtractions = new Map<string, Promise<ExtractedArtwork | null>>();

    constructor(
        taglib = new TagLibAdapter(),
        ffprobe = new FFprobeAdapter(),
        mediaInfo = new MediaInfoAdapter(),
        cacheDir = serverEnv.ART_CACHE_DIR
    ) {
        this.taglib = taglib;
        this.ffprobe = ffprobe;
        this.mediaInfo = mediaInfo;
        this.cacheDir = path.resolve(process.cwd(), cacheDir);
    }

    /* -------------------------- Single Read Operation ------------------------- */

    /**
     * Reads unified metadata for a single audio file.
     * Throws on failure.
     */
    public async read(filePath: string, options: ReadAudioOptions = {}): Promise<CombinedAudioMetadata> {
        const canonicalPath = await authorizeInputPath(filePath);
        const stats = await fs.promises.stat(canonicalPath);

        const includeArtwork = options.extractArtwork ?? true;
        const forceArtworkRefresh = options.forceArtworkRefresh ?? false;
        const includeQC = options.includeQC ?? false;

        const [tagResult, technical, qc, artwork] = await Promise.all([
            this.taglib.readTags(canonicalPath),
            this.ffprobe.inspect(canonicalPath),
            includeQC ? this.mediaInfo.inspect(canonicalPath).catch(() => null) : Promise.resolve(null),
            includeArtwork ? this.extractArtwork(canonicalPath, forceArtworkRefresh).catch(() => null) : Promise.resolve(null),
        ]);

        if (technical.channels === 0 && technical.sampleRate === 0 && technical.duration === 0) {
            throw new BadRequestError(`File "${path.basename(canonicalPath)}" is corrupt or contains no valid audio stream`);
        }

        return {
            filePath: canonicalPath,
            fileSizeBytes: stats.size,
            lastModified: stats.mtime.toISOString(),
            tags: tagResult.tags,
            technical,
            qc,
            artwork,
            rawTagMetadata: options.includeRawPayload ? tagResult.raw : undefined,
            rawFFprobeMetadata: options.includeRawPayload ? technical.rawFormat : undefined,
            rawMediaInfoMetadata: options.includeRawPayload ? qc?.rawTracks : undefined,
        };
    }

    /* -------------------------- Batch Read Operation -------------------------- */

    /**
     * Reads metadata for multiple pre-authorized files with bounded concurrency.
     * Catches individual file errors so one failing file does not abort the queue.
     */
    public async readBatch(canonicalPaths: string[], options: ReadAudioOptions = {}, concurrency = 8): Promise<Map<string, CombinedAudioMetadata>> {
        const results = new Map<string, CombinedAudioMetadata>();
        if (!canonicalPaths || canonicalPaths.length === 0) {
            return results;
        }

        const queue = [...canonicalPaths];

        const worker = async () => {
            while (queue.length > 0) {
                const nextPath = queue.shift();
                if (!nextPath) break;

                try {
                    const metadata = await this.read(nextPath, options);
                    results.set(nextPath, metadata);
                } catch {
                    // Intentionally skipped in batch read
                }
            }
        };

        const workers = Array.from({ length: Math.min(concurrency, canonicalPaths.length) }, () => worker());
        await Promise.all(workers);

        return results;
    }

    /* -------------------------- Single Write Operation ------------------------ */

    /**
     * Updates metadata tags on a single audio file and invalidates its artwork cache.
     * Throws on failure.
     */
    public async writeTags(filePath: string, tags: WriteAudioTags, options: TagWriteOptions = {}): Promise<TagWriteResult> {
        const canonicalPath = await authorizeInputPath(filePath);
        const result = await this.taglib.writeTags(canonicalPath, tags, options);
        await this.invalidateArtworkCache(canonicalPath);
        return result;
    }

    /* -------------------------- Batch Write Operation ------------------------- */

    /**
     * Updates tags across multiple files. Catches individual item errors to populate failed[].
     */
    public async writeTagsBatch(targets: Array<{ path: string; tags: WriteAudioTags }>, options: TagWriteOptions = {}): Promise<BatchTagWriteResult> {
        const succeeded: TagWriteResult[] = [];
        const failed: BatchTagWriteFailure[] = [];

        for (const target of targets) {
            try {
                const res = await this.writeTags(target.path, target.tags, options);
                succeeded.push(res);
            } catch (err) {
                failed.push({
                    filePath: target.path,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }

        return {
            total: targets.length,
            succeeded,
            failed,
        };
    }

    /* --------------------------- Artwork Orchestration ------------------------ */

    /**
     * Resolves artwork by audio file path or direct cached file name.
     */
    public async findArtwork(query: { path?: string; file?: string }): Promise<ExtractedArtwork | null> {
        if (query.file) {
            const cachedPath = path.join(this.cacheDir, path.basename(query.file));
            try {
                const stats = await fs.promises.stat(cachedPath);
                if (stats.size > 0) {
                    const buffer = await fs.promises.readFile(cachedPath);
                    const { width, height, mimeType } = await getImageMetadata(buffer);
                    return {
                        cachedPath,
                        filename: path.basename(query.file),
                        mimeType,
                        sizeBytes: stats.size,
                        width,
                        height,
                    };
                }
            } catch {
                return null;
            }
        }

        if (query.path) {
            return this.extractArtwork(query.path);
        }

        return null;
    }

    /**
     * Extracts embedded artwork from an audio file, persists to disk cache, and returns metadata.
     * Deduplicates concurrent extraction requests for the exact same file.
     */
    public async extractArtwork(filePath: string, forceRefresh = false): Promise<ExtractedArtwork | null> {
        const canonicalPath = await authorizeInputPath(filePath);

        if (!forceRefresh && this.activeExtractions.has(canonicalPath)) {
            return this.activeExtractions.get(canonicalPath)!;
        }

        const task = this.executeExtractArtwork(canonicalPath, forceRefresh).finally(() => {
            this.activeExtractions.delete(canonicalPath);
        });

        this.activeExtractions.set(canonicalPath, task);
        return task;
    }

    private async executeExtractArtwork(canonicalPath: string, forceRefresh: boolean): Promise<ExtractedArtwork | null> {
        const stats = await fs.promises.stat(canonicalPath);
        const cacheKey = this.computeCacheKey(canonicalPath, stats.size, stats.mtimeMs);

        await fs.promises.mkdir(this.cacheDir, { recursive: true });

        const cachedJpg = path.join(this.cacheDir, `${cacheKey}.jpg`);
        const cachedPng = path.join(this.cacheDir, `${cacheKey}.png`);

        if (!forceRefresh) {
            for (const candidate of [cachedJpg, cachedPng]) {
                try {
                    const cStats = await fs.promises.stat(/*turbopackIgnore: true*/ candidate);
                    if (cStats.size > 100) {
                        const buffer = await fs.promises.readFile(/*turbopackIgnore: true*/ candidate);
                        const { width, height, mimeType } = await getImageMetadata(buffer);
                        return {
                            cachedPath: candidate,
                            filename: path.basename(candidate),
                            mimeType,
                            sizeBytes: cStats.size,
                            width,
                            height,
                        };
                    }
                } catch {
                    // Try next candidate
                }
            }
        }

        const tagResult = await this.taglib.readTags(canonicalPath);
        if (!tagResult.artwork || !tagResult.artwork.data || tagResult.artwork.data.length === 0) {
            return null;
        }

        const { width, height, mimeType } = await getImageMetadata(tagResult.artwork.data);
        const ext = mimeType === 'image/png' ? 'png' : 'jpg';
        const destination = path.join(/*turbopackIgnore: true*/ this.cacheDir, `${cacheKey}.${ext}`);

        await fs.promises.writeFile(/*turbopackIgnore: true*/ destination, tagResult.artwork.data);

        return {
            cachedPath: destination,
            filename: `${cacheKey}.${ext}`,
            mimeType,
            sizeBytes: tagResult.artwork.data.length,
            width,
            height,
        };
    }

    /**
     * Embeds an image buffer into an audio file and invalidates cache.
     */
    public async embedArtwork(filePath: string, imageBuffer: Buffer, options: TagWriteOptions = {}): Promise<TagWriteResult> {
        const canonicalPath = await authorizeInputPath(filePath);
        const { mimeType } = await getImageMetadata(imageBuffer);
        const result = await this.taglib.embedArtwork(canonicalPath, imageBuffer, mimeType, options);
        await this.invalidateArtworkCache(canonicalPath);
        return result;
    }

    /**
     * Removes all embedded artwork from an audio file and purges cache.
     */
    public async removeArtwork(filePath: string, options: TagWriteOptions = {}): Promise<TagWriteResult> {
        const canonicalPath = await authorizeInputPath(filePath);
        const result = await this.taglib.removeArtwork(canonicalPath, options);
        await this.invalidateArtworkCache(canonicalPath);
        return result;
    }

    /**
     * Invalidates cached artwork files for an audio file.
     */
    public async invalidateArtworkCache(canonicalPath: string): Promise<void> {
        try {
            const stats = await fs.promises.stat(canonicalPath);
            const key = this.computeCacheKey(canonicalPath, stats.size, stats.mtimeMs);
            await fs.promises.unlink(path.join(this.cacheDir, `${key}.jpg`)).catch(() => {});
            await fs.promises.unlink(path.join(this.cacheDir, `${key}.png`)).catch(() => {});
        } catch {
            // Ignore if file deleted or moved
        }
    }

    private computeCacheKey(filePath: string, size: number, mtimeMs: number): string {
        const normalized = filePath.replace(/\\+/g, '/').toLowerCase();
        return crypto
            .createHash('sha256')
            .update(`${normalized}:${size}:${Math.floor(mtimeMs)}`)
            .digest('hex')
            .slice(0, 24);
    }
}

/**
 * Singleton instance of MetadataCoordinator owning shared in-flight deduplication state.
 */
export const metadataCoordinator = new MetadataCoordinator();
