import type { AudioTags, ConversionTargetFormat, WriteAudioTags } from '@/lib/media';

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

/* ----------------------- Unified Elementary Probing Models ---------------- */

/**
 * Standardized audio stream properties shared between FFprobe and MediaInfo.
 * Fields with the same semantic responsibility share identical names and types across engines.
 */
export interface AudioStreamInfo {
    index: number;
    default?: boolean;

    codec: string;
    codecLongName?: string;
    codecId?: string;
    codecTag?: string;
    profile?: string;

    sampleFormat?: string;
    sampleRate?: number;

    channels: number;
    channelLayout?: string;

    /** Primary true bit depth (e.g. 16, 24, 32 bit). */
    bitDepth?: number;
    /** Container/stream-specified bits per sample. */
    bitsPerSample?: number;
    /** Raw decoded bits per sample. */
    bitsPerRawSample?: number;

    bitRate?: number;
    bitRateMode?: string;
    bitRateModeLabel?: string;

    duration?: number;
    streamSize?: number;
    language?: string;
    isLossless: boolean;
}

/**
 * Standardized cover art / attached image track properties shared between engines.
 */
export interface CoverArtInfo {
    index: number;
    type?: string;
    typeString?: string;

    codec: string;
    codecLongName?: string;
    codecId?: string;
    codecTag?: string;
    profile?: string;

    width?: number;
    height?: number;
    aspectRatio?: number;
    mimeType?: string;

    sampleAspectRatio?: string;
    displayAspectRatio?: string;
}

/* ------------------------- FFprobe Engine Models -------------------------- */

export type FFprobeAudioStream = AudioStreamInfo;
export type FFprobeCoverArt = CoverArtInfo;

export interface FFprobeNormalizedResult {
    container: string;
    containerFormat?: string;
    containerLongName?: string;
    duration?: number;
    bitRate?: number;
    size: number;
    probeScore?: number;
    isLossless: boolean;
    hasAudio: boolean;
    hasCoverArt: boolean;
    coverArts: CoverArtInfo[];
    audio: AudioStreamInfo[];
}

export interface FFprobeInspectionResult extends FFprobeNormalizedResult {
    raw: unknown;
}

export type TechnicalAudioInfo = FFprobeInspectionResult;

/* ----------------------- MediaInfo Forensic QC Models --------------------- */

export interface MediaInfoAudioTrack extends AudioStreamInfo {
    streamKindId?: number;
    streamPosition?: number;
    streamOrder?: number;

    uniqueId?: string;

    format?: string;
    formatCommercial?: string;
    codecIdDescription?: string;
    formatVersion?: string;
    formatSettings?: string;
    additionalFeatures?: string;
    internetMediaType?: string;
    muxingMode?: string;

    bitRateEncoded?: number;
    bitRateMinimum?: number;
    bitRateMaximum?: number;
    bitRateNominal?: number;

    channelsOriginal?: number;
    channelLayoutOriginal?: string;
    channelPositions?: string;
    channelPositionsOriginal?: string;
    channelPositionsString2?: string;

    sampleCount?: number;

    bitDepthDetected?: number;
    bitDepthStored?: number;

    compressionMode?: string;
    compressionRatio?: number;

    durationFirstFrame?: number;
    durationLastFrame?: number;

    streamSizeEncoded?: number;
    streamSizeDemuxed?: number;
    streamSizeProportion?: number;

    forced?: boolean;
    disabled?: boolean;

    encodedLibrary?: string;
    encodedLibraryString?: string;
    encodedLibraryName?: string;
    encodedLibraryVersion?: string;
    encodedLibrarySettings?: string;

    encodedApplication?: string;
    encodedApplicationVersion?: string;

    audioMd5?: string;
}

export interface MediaInfoImageTrack extends CoverArtInfo {
    streamKindId?: number;
    streamPosition?: number;
    streamOrder?: number;

    uniqueId?: string;

    format?: string;
    formatName?: string;
    codecIdDescription?: string;
    formatVersion?: string;
    formatSettings?: string;
    internetMediaType?: string;
    muxingMode?: string;

    colorSpace?: string;
    chromaSubsampling?: string;
    bitDepth?: number;
    compressionMode?: string;
    compressionRatio?: number;

    colorDescriptionPresent?: string;
    colorPrimaries?: string;
    colorRange?: string;
    matrixCoefficients?: string;
    transferCharacteristics?: string;

    streamSize?: number;
    streamSizeProportion?: number;

    default?: boolean;
    forced?: boolean;
    disabled?: boolean;
}

export interface MediaInfoOtherStream {
    type: string;
    streamKindId?: number;
    streamPosition?: number;
    streamOrder?: number;

    format?: string;
    codecId?: string;
    codecLongName?: string;

    duration?: number;
    streamSize?: number;

    width?: number;
    height?: number;
    channels?: number;
    sampleRate?: number;

    language?: string;
}

export interface MediaInfoStreamCounts {
    total: number;
    audio: number;
    image: number;
    video: number;
    text: number;
    menu: number;
    other: number;
    unknown: number;
}

export interface MediaInfoNormalizedResult {
    container: string;
    containerFormat?: string;
    containerLongName?: string;
    containerCommercial?: string;
    containerProfile?: string;
    containerVersion?: string;
    containerCodecId?: string;
    mimeType?: string;

    duration?: number;
    bitRate?: number;
    bitRateMode?: string;
    bitRateModeLabel?: string;
    bitRateMinimum?: number;
    bitRateMaximum?: number;
    bitRateNominal?: number;

    size?: number;
    dataSize?: number;
    headerSize?: number;
    footerSize?: number;

    isStreamable?: boolean;
    audioChannelsTotal?: number;

    streamCounts: MediaInfoStreamCounts;

    hasAudio: boolean;
    hasCoverArt: boolean;
    isLossless: boolean;

    audio: MediaInfoAudioTrack[];
    coverArts: MediaInfoImageTrack[];
    otherStreams: MediaInfoOtherStream[];
}

export interface MediaInfoInspectionResult extends MediaInfoNormalizedResult {
    raw: unknown;
}

export type MediaInfoQC = MediaInfoInspectionResult;

/* ------------------------ Unified Metadata Models ------------------------- */

export interface CombinedAudioMetadata {
    filePath: string;
    fileSizeBytes: number;
    lastModified: string;
    tags: AudioTags;
    technical: FFprobeInspectionResult;
    qc?: MediaInfoInspectionResult | null;
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
    inspect(canonicalPath: string): Promise<FFprobeInspectionResult>;
}

/** Quality-Control Prober Adapter interface for forensic media and bitrate metrics. */
export interface QualityControlAdapter {
    inspect(canonicalPath: string): Promise<MediaInfoInspectionResult>;
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
