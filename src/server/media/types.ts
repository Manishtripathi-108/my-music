import type { AudioTags, BitrateMode, ConversionTargetFormat, WriteAudioTags } from '@/lib/media';

/* -------------------------- Artwork Domain Models ------------------------- */

export interface ExtractedArtwork {
    cachedPath: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    width?: number;
    height?: number;
}

export interface RawPictureData {
    data: Buffer;
    mimeType: string;
    description?: string;
}

/* ------------------------- Technical Probing Models ----------------------- */

export interface TechnicalAudioInfo {
    codec: string;
    codecLongName: string;
    containerFormat: string;
    containerLongName: string;
    duration: number;
    bitrate: number;
    sampleRate: number;
    channels: number;
    channelLayout?: string;
    bitsPerSample?: number;
    isLossless: boolean;
    hasAttachedPicture: boolean;
    streamCount: number;
    rawStreams?: unknown[];
    rawFormat?: unknown;
}

export interface MediaInfoQC {
    format: string;
    bitrateMode?: BitrateMode;
    overallBitrate?: number;
    maximumBitrate?: number;
    bitDepth?: number;
    compressionMode?: string;
    encodedLibrary?: string;
    encodedLibrarySettings?: string;
    delay?: number;
    padding?: number;
    replayGain?: {
        trackGain?: number;
        trackPeak?: number;
        albumGain?: number;
        albumPeak?: number;
    };
    rawTracks?: unknown[];
}

/* ------------------------ Unified Metadata Models ------------------------- */

export interface CombinedAudioMetadata {
    filePath: string;
    fileSizeBytes: number;
    lastModified: string;
    tags: AudioTags;
    technical: TechnicalAudioInfo;
    qc?: MediaInfoQC | null;
    artwork?: ExtractedArtwork | null;
    rawTagMetadata?: Record<string, unknown>;
    rawFFprobeMetadata?: unknown;
    rawMediaInfoMetadata?: unknown;
}

export interface BatchMetadataResponse {
    total: number;
    results: Record<string, CombinedAudioMetadata>;
}

export interface ReadAudioOptions {
    extractArtwork?: boolean;
    forceArtworkRefresh?: boolean;
    includeQC?: boolean;
    includeRawPayload?: boolean;
}

/* --------------------------- Tag Writing Models --------------------------- */

export interface TagWriteOptions {
    preserveOriginal?: boolean;
}

export interface TagWriteResult {
    filePath: string;
    backupPath?: string;
    tags: AudioTags;
}

export interface BatchTagWriteFailure {
    filePath: string;
    error: string;
}

export interface BatchTagWriteResult {
    total: number;
    succeeded: TagWriteResult[];
    failed: BatchTagWriteFailure[];
}

/* -------------------------- Audio Conversion Models ----------------------- */

export interface ConversionOptions {
    outputPath?: string;
    targetFormat: ConversionTargetFormat;
    bitrate?: string;
    sampleRate?: number;
    bitDepth?: 16 | 24 | 32;
    channels?: 1 | 2;
    downmixStereo?: boolean;
    resampler?: 'soxr';
    ditherMethod?: 'triangular' | 'lipshitz';
    applyNormalization?: boolean;
}

export interface ConversionProgress {
    percent: number;
    currentTimeSeconds: number;
    speed: string;
    fps: number;
    bitRateKbps: number;
}

export type ConversionProgressCallback = (progress: ConversionProgress) => void;

export interface ConversionResult {
    inputPath: string;
    outputPath: string;
    targetFormat: ConversionTargetFormat;
    sizeBytes: number;
    duration: number;
}

/* --------------------------- Adapter Interfaces --------------------------- */

/** Audio Metadata Adapter interface for reading and writing audio tags and artwork. */
export interface MetadataAdapter {
    readTags(canonicalPath: string): Promise<{
        tags: AudioTags;
        raw: Record<string, unknown>;
        artwork: RawPictureData | null;
    }>;
    writeTags(canonicalPath: string, tags: WriteAudioTags, options?: TagWriteOptions): Promise<TagWriteResult>;
    embedArtwork(canonicalPath: string, imageBuffer: Buffer, mimeType?: string, options?: TagWriteOptions): Promise<TagWriteResult>;
    removeArtwork(canonicalPath: string, options?: TagWriteOptions): Promise<TagWriteResult>;
}

/** Audio Prober Adapter interface for stream parameters and container format inspection. */
export interface AudioProberAdapter {
    inspect(canonicalPath: string): Promise<TechnicalAudioInfo>;
}

/** Quality-Control Prober Adapter interface for forensic media and bitrate metrics. */
export interface QualityControlAdapter {
    inspect(canonicalPath: string): Promise<MediaInfoQC>;
}

/** Media Converter Engine interface for audio transcoding and DSP operations. */
export interface MediaConverterEngine {
    convert(
        inputPath: string,
        options: ConversionOptions,
        onProgress?: ConversionProgressCallback,
        signal?: AbortSignal
    ): Promise<ConversionResult>;
}
