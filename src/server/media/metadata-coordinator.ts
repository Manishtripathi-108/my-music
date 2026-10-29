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
     * Reads unified metadata for a single audio file in a single I/O pass.
     */
    public async read(filePath: string, options: ReadAudioOptions = {}): Promise<CombinedAudioMetadata> {
        const canonicalPath = await authorizeInputPath(filePath);
        const stats = await fs.promises.stat(canonicalPath);

        const includeArtwork = options.extractArtwork ?? true;
        const forceArtworkRefresh = options.forceArtworkRefresh ?? false;
        const includeQC = options.includeQC ?? false;

        // Run TagLib, FFprobe, and optional MediaInfo in parallel
        const [tagResult, technical, qc] = await Promise.all([
            this.taglib.readTags(canonicalPath),
            this.ffprobe.inspect(canonicalPath),
            includeQC ? this.mediaInfo.inspect(canonicalPath).catch(() => null) : Promise.resolve(null),
        ]);

        if (technical.channels === 0 && technical.sampleRate === 0 && technical.duration === 0) {
            throw new BadRequestError(`File "${path.basename(canonicalPath)}" is corrupt or contains no valid audio stream`);
        }

        // Reuse the artwork buffer already parsed by taglib.readTags() instead of re-reading from disk
        let artwork: ExtractedArtwork | null = null;
        if (includeArtwork) {
            if (tagResult.artwork?.data) {
                artwork = await this.saveOrGetCachedArtwork(canonicalPath, stats, tagResult.artwork.data, forceArtworkRefresh);
            } else {
                artwork = await this.findCachedArtworkForFile(canonicalPath, stats);
            }
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
     */
    public async readBatch(canonicalPaths: string[], options: ReadAudioOptions = {}, concurrency = 8): Promise<Map<string, CombinedAudioMetadata>> {
        const results = new Map<string, CombinedAudioMetadata>();
        if (!canonicalPaths || canonicalPaths.length === 0) {
            return results;
        }

        let currentIndex = 0;
        const worker = async () => {
            while (currentIndex < canonicalPaths.length) {
                const nextPath = canonicalPaths[currentIndex++];
                if (!nextPath) break;

                try {
                    const metadata = await this.read(nextPath, options);
                    results.set(nextPath, metadata);
                } catch {
                    // Intentionally skipped in batch read
                }
            }
        };

        const workerCount = Math.min(concurrency, canonicalPaths.length);
        await Promise.all(Array.from({ length: workerCount }, () => worker()));

        return results;
    }

    /* -------------------------- Single Write Operation ------------------------ */

    /**
     * Updates metadata tags on a single audio file and invalidates its artwork cache.
     */
    public async writeTags(filePath: string, tags: WriteAudioTags, options: TagWriteOptions = {}): Promise<TagWriteResult> {
        const canonicalPath = await authorizeInputPath(filePath);
        const preStats = await fs.promises.stat(canonicalPath).catch(() => null);

        const result = await this.taglib.writeTags(canonicalPath, tags, options);

        if (preStats) {
            await this.purgeCacheKey(canonicalPath, preStats.size, preStats.mtimeMs);
        }
        await this.invalidateArtworkCache(canonicalPath);
        return result;
    }

    /* -------------------------- Batch Write Operation ------------------------- */

    /**
     * Updates tags across multiple files.
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
                    return await this.buildExtractedArtwork(cachedPath, buffer);
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

        if (!forceRefresh) {
            const existing = await this.findCachedArtworkForFile(canonicalPath, stats);
            if (existing) return existing;
        }

        const tagResult = await this.taglib.readTags(canonicalPath);
        if (!tagResult.artwork?.data || tagResult.artwork.data.length === 0) {
            return null;
        }

        return this.saveOrGetCachedArtwork(canonicalPath, stats, tagResult.artwork.data, forceRefresh);
    }

    private async findCachedArtworkForFile(canonicalPath: string, stats: fs.Stats): Promise<ExtractedArtwork | null> {
        const cacheKey = this.computeCacheKey(canonicalPath, stats.size, stats.mtimeMs);
        for (const ext of ['jpg', 'png', 'webp']) {
            const candidate = path.join(/*turbopackIgnore: true*/ this.cacheDir, `${cacheKey}.${ext}`);
            try {
                const cStats = await fs.promises.stat(/*turbopackIgnore: true*/ candidate);
                if (cStats.size > 100) {
                    const buffer = await fs.promises.readFile(/*turbopackIgnore: true*/ candidate);
                    return await this.buildExtractedArtwork(candidate, buffer);
                }
            } catch {
                // Check next extension candidate
            }
        }
        return null;
    }

    private async saveOrGetCachedArtwork(
        canonicalPath: string,
        stats: fs.Stats,
        artworkBuffer: Buffer,
        forceRefresh = false
    ): Promise<ExtractedArtwork> {
        const cacheKey = this.computeCacheKey(canonicalPath, stats.size, stats.mtimeMs);
        await fs.promises.mkdir(/*turbopackIgnore: true*/ this.cacheDir, { recursive: true });

        const { width, height, mimeType } = await getImageMetadata(artworkBuffer);
        const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
        const destination = path.join(/*turbopackIgnore: true*/ this.cacheDir, `${cacheKey}.${ext}`);

        if (forceRefresh || !(await fs.promises.stat(/*turbopackIgnore: true*/ destination).catch(() => null))) {
            await fs.promises.writeFile(/*turbopackIgnore: true*/ destination, artworkBuffer);
        }

        return {
            cachedPath: destination,
            filename: `${cacheKey}.${ext}`,
            mimeType,
            sizeBytes: artworkBuffer.length,
            width,
            height,
        };
    }

    private async buildExtractedArtwork(cachedPath: string, buffer: Buffer): Promise<ExtractedArtwork> {
        const { width, height, mimeType } = await getImageMetadata(buffer);
        return {
            cachedPath,
            filename: path.basename(cachedPath),
            mimeType,
            sizeBytes: buffer.length,
            width,
            height,
        };
    }

    /**
     * Embeds an image buffer into an audio file and invalidates cache.
     */
    public async embedArtwork(filePath: string, imageBuffer: Buffer, options: TagWriteOptions = {}): Promise<TagWriteResult> {
        const canonicalPath = await authorizeInputPath(filePath);
        const preStats = await fs.promises.stat(canonicalPath).catch(() => null);

        const { mimeType } = await getImageMetadata(imageBuffer);
        const result = await this.taglib.embedArtwork(canonicalPath, imageBuffer, mimeType, options);

        if (preStats) {
            await this.purgeCacheKey(canonicalPath, preStats.size, preStats.mtimeMs);
        }
        await this.invalidateArtworkCache(canonicalPath);
        return result;
    }

    /**
     * Removes all embedded artwork from an audio file and purges cache.
     */
    public async removeArtwork(filePath: string, options: TagWriteOptions = {}): Promise<TagWriteResult> {
        const canonicalPath = await authorizeInputPath(filePath);
        const preStats = await fs.promises.stat(canonicalPath).catch(() => null);

        const result = await this.taglib.removeArtwork(canonicalPath, options);

        if (preStats) {
            await this.purgeCacheKey(canonicalPath, preStats.size, preStats.mtimeMs);
        }
        await this.invalidateArtworkCache(canonicalPath);
        return result;
    }

    /**
     * Invalidates cached artwork files for an audio file.
     */
    public async invalidateArtworkCache(canonicalPath: string): Promise<void> {
        try {
            const stats = await fs.promises.stat(canonicalPath);
            await this.purgeCacheKey(canonicalPath, stats.size, stats.mtimeMs);
        } catch {
            // Ignore if file deleted or moved
        }
    }

    private async purgeCacheKey(canonicalPath: string, size: number, mtimeMs: number): Promise<void> {
        const key = this.computeCacheKey(canonicalPath, size, mtimeMs);
        for (const ext of ['jpg', 'png', 'webp']) {
            await fs.promises.unlink(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ this.cacheDir, `${key}.${ext}`)).catch(() => {});
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

export const metadataCoordinator = new MetadataCoordinator();
