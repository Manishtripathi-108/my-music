import type { AudioTags, BitrateMode, ConversionTargetFormat } from '@/lib/media';

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
