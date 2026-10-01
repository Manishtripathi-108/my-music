import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import 'server-only';

import { serverEnv } from '@/config/env.server';

import { ExifClient, getExifClient } from '../exif';
import { AudioProber, createAudioProber } from '../ffprobe';
import type {
    AudioTags,
    CombinedAudioMetadata,
    ExtractedArtwork,
    ReadAudioOptions,
} from '../types';

/** Minimum valid image size in bytes — anything smaller is empty or corrupt. */
const MIN_IMAGE_BYTES = 100;

/* -------------------------------- MetaReader ------------------------------- */

/**
 * Coordinates ExifTool and FFprobe to produce a unified metadata result
 * for each audio file. Manages artwork cache lookup, cache keys,
 * format validation, and concurrency deduplication.
 */
export class MetaReader {
    private readonly exif: ExifClient;
    private readonly audioProber: AudioProber;
    private readonly cacheDir: string;
    private readonly activeExtractions = new Map<string, Promise<ExtractedArtwork | null>>();

    constructor(exif = getExifClient(), audioProber = createAudioProber(), cacheDir?: string) {
        this.exif = exif;
        this.audioProber = audioProber;
        const artDirectory = cacheDir ?? serverEnv.ART_CACHE_DIR;
        this.cacheDir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), artDirectory);
    }

    /* ------------------------- Public Read Operations ------------------------- */

    /**
     * Reads full metadata for one audio file — merges FFprobe
     * technical properties, ExifTool tags, and embedded artwork.
     */
    public async read(filePath: string, options: ReadAudioOptions = {}): Promise<CombinedAudioMetadata> {
        const absolutePath = path.resolve(filePath);
        let stats: fs.Stats;
        try {
            stats = await fs.promises.stat(absolutePath);
        } catch {
            throw new Error(`Audio file not found or inaccessible: "${absolutePath}"`);
        }

        const includeArtwork = options.extractArtwork ?? true;
        const forceArtworkRefresh = options.forceArtworkRefresh ?? false;

        const [technical, rawExifRecord, extractedArtwork] = await Promise.all([
            this.audioProber.inspect(absolutePath),
            this.exif.readMetadata(absolutePath),
            includeArtwork ? this.extractArtwork(absolutePath, forceArtworkRefresh).catch(() => null) : Promise.resolve(null),
        ]);

        const rawExif = rawExifRecord ?? {};
        const tags = this.normalizeAudioTags(rawExif);

        return {
            filePath: absolutePath,
            fileSizeBytes: stats.size,
            lastModified: stats.mtime.toISOString(),
            tags,
            technical,
            artwork: extractedArtwork,
            rawExifToolMetadata: options.includeRawPayload === false ? {} : rawExif,
            rawFFprobeMetadata:
                options.includeRawPayload === false
                    ? {}
                    : {
                        format: technical.rawFormat,
                        streams: technical.rawStreams,
                    },
        };
    }

    /**
     * Reads metadata for a batch of audio files using multi-file ExifTool
     * and bounded concurrent FFprobe workers.
     */
    public async readBatch(
        filePaths: string[],
        options: ReadAudioOptions = {},
        concurrency = 8
    ): Promise<Map<string, CombinedAudioMetadata>> {
        const results = new Map<string, CombinedAudioMetadata>();
        if (!filePaths || filePaths.length === 0) {
            return results;
        }

        const normalizedPaths = filePaths.map((filePath) => path.resolve(filePath));

        const [exifMap, probeMap] = await Promise.all([
            this.exif.readBatch(normalizedPaths),
            this.audioProber.inspectBatch(normalizedPaths, concurrency),
        ]);

        const includeArtwork = options.extractArtwork ?? true;
        const forceArtworkRefresh = options.forceArtworkRefresh ?? false;

        await Promise.all(
            normalizedPaths.map(async (filePath) => {
                const technical = probeMap.get(filePath);
                if (!technical) {
                    return;
                }

                let stats: fs.Stats;
                try {
                    stats = await fs.promises.stat(filePath);
                } catch {
                    return;
                }

                const rawExif = exifMap.get(filePath) ?? {};
                let extractedArtwork: ExtractedArtwork | null = null;
                if (includeArtwork) {
                    try {
                        extractedArtwork = await this.extractArtwork(filePath, forceArtworkRefresh);
                    } catch {
                        // Artwork extraction is non-blocking for batch reads.
                    }
                }

                const tags = this.normalizeAudioTags(rawExif);

                results.set(filePath, {
                    filePath,
                    fileSizeBytes: stats.size,
                    lastModified: stats.mtime.toISOString(),
                    tags,
                    technical,
                    artwork: extractedArtwork,
                    rawExifToolMetadata: options.includeRawPayload === false ? {} : rawExif,
                    rawFFprobeMetadata:
                        options.includeRawPayload === false
                            ? {}
                            : {
                                format: technical.rawFormat,
                                streams: technical.rawStreams,
                            },
                });
            })
        );

        return results;
    }

    /* --------------------------- Artwork Operations --------------------------- */

    /**
     * Extracts embedded artwork for a single audio file with caching,
     * deduplication, and magic-byte format validation.
     */
    public async extractArtwork(filePath: string, forceRefresh = false): Promise<ExtractedArtwork | null> {
        const absolutePath = path.resolve(filePath);
        let stats: fs.Stats;
        try {
            stats = await fs.promises.stat(absolutePath);
        } catch {
            return null;
        }

        const cacheKey = this.generateCacheKey(absolutePath, stats);

        if (!forceRefresh) {
            const inFlight = this.activeExtractions.get(cacheKey);
            if (inFlight) {
                return inFlight;
            }

            const cached = await this.findCached(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const extractionPromise = this.performArtworkExtraction(absolutePath, cacheKey).finally(() => {
            this.activeExtractions.delete(cacheKey);
        });

        this.activeExtractions.set(cacheKey, extractionPromise);
        return extractionPromise;
    }

    /**
     * Resolves artwork for a query containing either a cached image filename
     * or an audio file path. Returns the ExtractedArtwork descriptor without reading binary data.
     */
    public async findArtwork(query: { file?: string; path?: string }): Promise<ExtractedArtwork | null> {
        if (query.file) {
            const safeFilename = path.basename(query.file);
            const cachedPath = path.join(this.cacheDir, safeFilename);
            try {
                const stats = await fs.promises.stat(cachedPath);
                if (stats.size > MIN_IMAGE_BYTES) {
                    const extension = path.extname(safeFilename).toLowerCase().replace('.', '');
                    return {
                        cachedPath,
                        filename: safeFilename,
                        mimeType: this.mimeTypeFor(extension),
                        sizeBytes: stats.size,
                        source: 'cache',
                    };
                }
            } catch {
                // Not in cache, fallback to checking as audio file path
            }

            return this.extractArtwork(query.file);
        }

        if (query.path) {
            return this.extractArtwork(query.path);
        }

        return null;
    }

    /**
     * Generates a deterministic cache key from file identity properties.
     */
    private generateCacheKey(filePath: string, stats: { size: number; mtimeMs: number }): string {
        const absolutePath = path.resolve(filePath);
        return crypto.createHash('sha256').update(`${absolutePath}:${stats.size}:${stats.mtimeMs}`).digest('hex').slice(0, 24);
    }

    private async findCached(cacheKey: string): Promise<ExtractedArtwork | null> {
        const extensions = ['jpg', 'png', 'webp', 'gif'] as const;
        for (const extension of extensions) {
            const filename = `${cacheKey}.${extension}`;
            const fullPath = path.join(/*turbopackIgnore: true*/ this.cacheDir, filename);
            try {
                const stats = await fs.promises.stat(/*turbopackIgnore: true*/ fullPath);
                if (stats.size > MIN_IMAGE_BYTES) {
                    return {
                        cachedPath: fullPath,
                        filename,
                        mimeType: this.mimeTypeFor(extension),
                        sizeBytes: stats.size,
                        source: 'cache',
                    };
                }
            } catch {
                // File does not exist or inaccessible, check next extension
            }
        }
        return null;
    }

    private async performArtworkExtraction(sourcePath: string, cacheKey: string): Promise<ExtractedArtwork | null> {
        await fs.promises.mkdir(this.cacheDir, { recursive: true });

        const temporaryFilename = `${cacheKey}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.tmp`;
        const temporaryPath = path.join(/*turbopackIgnore: true*/ this.cacheDir, temporaryFilename);

        try {
            const extraction = await this.exif.extractArtwork(sourcePath, temporaryPath);
            if (!extraction) {
                await fs.promises.unlink(temporaryPath).catch(() => { });
                return null;
            }

            const format = await this.detectImageFormat(temporaryPath);
            if (!format) {
                await fs.promises.unlink(temporaryPath).catch(() => { });
                return null;
            }

            const filename = `${cacheKey}.${format}`;
            const finalPath = path.join(/*turbopackIgnore: true*/ this.cacheDir, filename);

            try {
                await fs.promises.rename(temporaryPath, finalPath);
            } catch {
                await fs.promises.unlink(finalPath).catch(() => { });
                await fs.promises.rename(temporaryPath, finalPath);
            }

            const finalStats = await fs.promises.stat(/*turbopackIgnore: true*/ finalPath);
            return {
                cachedPath: finalPath,
                filename,
                mimeType: this.mimeTypeFor(format),
                sizeBytes: finalStats.size,
                source: 'exiftool',
            };
        } catch {
            await fs.promises.unlink(temporaryPath).catch(() => { });
            return null;
        }
    }

    private async detectImageFormat(filePath: string): Promise<'jpg' | 'png' | 'webp' | 'gif' | null> {
        let fileHandle: fs.promises.FileHandle | null = null;
        try {
            fileHandle = await fs.promises.open(filePath, 'r');
            const header = Buffer.alloc(16);
            const { bytesRead } = await fileHandle.read(header, 0, 16, 0);
            if (bytesRead < 3) return null;
            return this.detectImageFormatFromBuffer(header);
        } catch {
            return null;
        } finally {
            if (fileHandle) {
                await fileHandle.close().catch(() => { });
            }
        }
    }

    private detectImageFormatFromBuffer(header: Buffer): 'jpg' | 'png' | 'webp' | 'gif' | null {
        if (header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
            return 'jpg';
        }
        if (header.length >= 4 && header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) {
            return 'png';
        }
        if (
            header.length >= 12 &&
            header[0] === 0x52 &&
            header[1] === 0x49 &&
            header[2] === 0x46 &&
            header[3] === 0x46 &&
            header[8] === 0x57 &&
            header[9] === 0x45 &&
            header[10] === 0x42 &&
            header[11] === 0x50
        ) {
            return 'webp';
        }
        if (header.length >= 3 && header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
            return 'gif';
        }
        return null;
    }

    private mimeTypeFor(format: string): string {
        switch (format) {
            case 'png':
                return 'image/png';
            case 'webp':
                return 'image/webp';
            case 'gif':
                return 'image/gif';
            case 'jpg':
            default:
                return 'image/jpeg';
        }
    }

    /* -------------------------- Health Verification --------------------------- */

    /**
     * Verifies the operational status of underlying system binaries (ExifTool and FFprobe).
     */
    public async ping(): Promise<{
        exiftool: boolean;
        ffprobe: boolean;
    }> {
        const [exiftoolOk, ffprobeOk] = await Promise.all([
            this.exif.ping(),
            this.audioProber.ping(),
        ]);

        return { exiftool: exiftoolOk, ffprobe: ffprobeOk };
    }

    /* --------------------------- Tag Normalization ---------------------------- */

    /**
     * Normalizes heterogeneous tags across ID3v2, Vorbis, QuickTime,
     * and RIFF into a clean AudioTags structure.
     */
    private normalizeAudioTags(raw: Record<string, unknown>): AudioTags {
        const findString = (...keys: string[]): string | undefined => {
            for (const key of keys) {
                const value = raw[key];
                if (typeof value === 'string' && value.trim().length > 0) {
                    return value.trim();
                }
                if (typeof value === 'number') {
                    return String(value);
                }
            }
            return undefined;
        };

        const title = findString('Title', 'ID3:Title', 'Vorbis:TITLE', 'QuickTime:Title', 'RIFF:Title');
        const artist = findString('Artist', 'ID3:Artist', 'Vorbis:ARTIST', 'QuickTime:Artist', 'RIFF:Artist');
        const album = findString('Album', 'ID3:Album', 'Vorbis:ALBUM', 'QuickTime:Album');
        const albumArtist = findString('AlbumArtist', 'Band', 'ID3:Band', 'Vorbis:ALBUMARTIST', 'QuickTime:AlbumArtist', 'QuickTime:Artist');
        const composer = findString('Composer', 'ID3:Composer', 'Vorbis:COMPOSER', 'QuickTime:Composer');
        const comment = findString('Comment', 'ID3:Comment', 'Vorbis:COMMENT', 'QuickTime:Comment');
        const lyrics = findString('Lyrics', 'ID3:Lyrics', 'Vorbis:LYRICS', 'UnsyncedLyrics');
        const isrc = findString('ISRC', 'ID3:ISRC', 'Vorbis:ISRC');
        const encoder = findString('Encoder', 'Software', 'ID3:EncodedBy', 'LavfEncoder');
        const copyright = findString('Copyright', 'ID3:Copyright', 'Vorbis:COPYRIGHT');

        /* ---------------------------- Genre Extraction ---------------------------- */

        let genre: string[] | undefined;
        const rawGenre = raw['Genre'] ?? raw['ID3:Genre'] ?? raw['Vorbis:GENRE'] ?? raw['QuickTime:Genre'];
        if (typeof rawGenre === 'string' && rawGenre.trim().length > 0) {
            genre = rawGenre
                .split(/[,;/]/)
                .map((value) => value.trim())
                .filter(Boolean);
        } else if (Array.isArray(rawGenre)) {
            genre = rawGenre
                .map(String)
                .map((value) => value.trim())
                .filter(Boolean);
        }

        /* ----------------------------- Track Numbers ------------------------------ */

        let trackNumber: number | undefined;
        let trackTotal: number | undefined;
        const rawTrack = findString('Track', 'TrackNumber', 'ID3:Track', 'Vorbis:TRACKNUMBER');
        if (rawTrack) {
            const parts = rawTrack.split('/');
            const parsed = parseInt(parts[0], 10);
            if (!isNaN(parsed)) trackNumber = parsed;
            if (parts[1]) {
                const total = parseInt(parts[1], 10);
                if (!isNaN(total)) trackTotal = total;
            }
        }
        if (!trackTotal) {
            const rawTotal = findString('TrackTotal', 'TotalTracks', 'ID3:TrackTotal');
            if (rawTotal) {
                const total = parseInt(rawTotal, 10);
                if (!isNaN(total)) trackTotal = total;
            }
        }

        /* ------------------------------ Disc Numbers ------------------------------ */

        let discNumber: number | undefined;
        let discTotal: number | undefined;
        const rawDisc = findString('DiscNumber', 'Disc', 'ID3:PartOfSet', 'Vorbis:DISCNUMBER');
        if (rawDisc) {
            const parts = rawDisc.split('/');
            const parsed = parseInt(parts[0], 10);
            if (!isNaN(parsed)) discNumber = parsed;
            if (parts[1]) {
                const total = parseInt(parts[1], 10);
                if (!isNaN(total)) discTotal = total;
            }
        }

        /* ----------------------------- Date and Year ------------------------------ */

        const dateString = findString('Date', 'Year', 'ID3:Year', 'RecordingTime', 'ReleaseDate', 'Vorbis:DATE');
        let year: number | undefined;
        if (dateString) {
            const match = dateString.match(/\b(19\d\d|20\d\d)\b/);
            if (match) year = parseInt(match[1], 10);
        }

        /* ---------------------------- ReplayGain Tags ----------------------------- */

        const replayGainTrackGain = findString('ReplaygainTrackGain', 'REPLAYGAIN_TRACK_GAIN');
        const replayGainTrackPeak = findString('ReplaygainTrackPeak', 'REPLAYGAIN_TRACK_PEAK');
        const replayGainAlbumGain = findString('ReplaygainAlbumGain', 'REPLAYGAIN_ALBUM_GAIN');
        const replayGainAlbumPeak = findString('ReplaygainAlbumPeak', 'REPLAYGAIN_ALBUM_PEAK');

        return {
            title,
            artist,
            artists: artist ? [artist] : undefined,
            album,
            albumArtist,
            composer,
            genre,
            year,
            date: dateString,
            trackNumber,
            trackTotal,
            discNumber,
            discTotal,
            comment,
            lyrics,
            isrc,
            replayGainTrackGain,
            replayGainTrackPeak,
            replayGainAlbumGain,
            replayGainAlbumPeak,
            encoder,
            copyright,
        };
    }
}

/* --------------------------- Singleton Instance --------------------------- */

const globalForMeta = globalThis as unknown as {
    __metaReader?: MetaReader;
};

/**
 * Returns the shared MetaReader instance.
 */
export function getMetaReader(): MetaReader {
    if (!globalForMeta.__metaReader) {
        globalForMeta.__metaReader = new MetaReader();
    }
    return globalForMeta.__metaReader;
}
