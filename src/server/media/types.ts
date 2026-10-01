export type ExifTagValue = string | number | string[] | null | undefined;

/**
 * Normalized technical audio properties extracted via FFprobe.
 */
export interface TechnicalAudioInfo {
    /** Codec identifier, for example `flac`, `alac`, `mp3`, or `aac`. */
    codec: string;

    /** Human-readable codec name. */
    codecLongName: string;

    /** Container format identifier. */
    containerFormat: string;

    /** Human-readable container format name. */
    containerLongName: string;

    /** Exact audio duration in seconds. */
    duration: number;

    /** Overall bitrate in bits per second. */
    bitrate: number;

    /** Audio sample rate in Hertz. */
    sampleRate: number;

    /** Number of audio channels. */
    channels: number;

    /** Channel layout, for example `stereo` or `5.1(side)`. */
    channelLayout?: string;

    /** Bits per sample when available. */
    bitsPerSample?: number;

    /** Whether the codec is mathematically lossless. */
    isLossless: boolean;

    /** Whether FFprobe detected an attached-picture stream (e.g. cover art). */
    hasAttachedPicture: boolean;

    /** Total stream count in the container. */
    streamCount: number;

    /** Raw FFprobe stream objects for advanced inspection. */
    rawStreams?: unknown[];

    /** Raw FFprobe format metadata for advanced inspection. */
    rawFormat?: Record<string, unknown>;
}

/**
 * Normalized audio tag metadata extracted via ExifTool.
 */
export interface AudioTags {
    title?: string;
    artist?: string;
    artists?: string[];
    album?: string;
    albumArtist?: string;
    composer?: string;
    genre?: string[];
    year?: number;
    date?: string;
    trackNumber?: number;
    trackTotal?: number;
    discNumber?: number;
    discTotal?: number;
    bpm?: number;
    compilation?: boolean;
    isrc?: string;
    comment?: string;
    lyrics?: string;
    rating?: number;
    replayGainTrackGain?: string;
    replayGainTrackPeak?: string;
    replayGainAlbumGain?: string;
    replayGainAlbumPeak?: string;
    encoder?: string;
    copyright?: string;
}

/**
 * Information about extracted & cached album artwork.
 */
export interface ExtractedArtwork {
    /** Absolute filesystem path to the cached image. */
    cachedPath: string;

    /** Cached image filename. */
    filename: string;

    /** Image MIME type. */
    mimeType: string;

    /** Image size in bytes. */
    sizeBytes: number;

    /** Image width when detected. */
    width?: number;

    /** Image height when detected. */
    height?: number;

    /** Tool that extracted the artwork, or whether it came from cache. */
    source: 'exiftool' | 'cache';
}

/**
 * Combined high-level audio metadata result produced by the MetaReader.
 * Merges technical parameters from FFprobe and tag metadata from ExifTool.
 */
export interface CombinedAudioMetadata {
    /** Normalized absolute path to the audio file. */
    filePath: string;

    /** File size in bytes. */
    fileSizeBytes: number;

    /** Last modified timestamp in ISO 8601 format. */
    lastModified: string;

    /** Normalized audio tags. */
    tags: AudioTags;

    /** Technical audio specifications from FFprobe. */
    technical: TechnicalAudioInfo;

    /** Cached album artwork details, when available. */
    artwork?: ExtractedArtwork | null;

    /** Raw ExifTool tag dictionary. */
    rawExifToolMetadata: Record<string, unknown>;

    /** Raw FFprobe response. */
    rawFFprobeMetadata: {
        format?: Record<string, unknown>;
        streams?: unknown[];
    };
}

/**
 * Options for reading audio file metadata through the coordinator.
 */
export interface ReadAudioOptions {
    /** Extract and cache embedded album artwork. Defaults to true. */
    extractArtwork?: boolean;

    /** Re-extract artwork even when a cached copy exists. Defaults to false. */
    forceArtworkRefresh?: boolean;

    /** Include raw FFprobe and ExifTool payloads. Defaults to true. */
    includeRawPayload?: boolean;
}

/**
 * Options for writing tags to an audio file.
 */
export interface TagWriteOptions {
    /** Keep ExifTool's `_original` backup. Defaults to false. */
    preserveOriginal?: boolean;

    /** Preserve the file modification timestamp. Defaults to true. */
    preserveFileTimestamp?: boolean;
}

/**
 * Result of writing tags to an audio file on success.
 */
export interface TagWriteResult {
    success: true;
    filePath: string;
    backupPath?: string;
}

/**
 * Target for writing tags in a batch operation.
 */
export interface BatchTagWriteTarget {
    path: string;
    tags: Record<string, ExifTagValue>;
}

/**
 * Details of a failed tag write for an individual file in a batch.
 */
export interface BatchTagWriteFailure {
    filePath: string;
    error: string;
}

/**
 * Result of a batch tag write operation.
 */
export interface BatchTagWriteResult {
    total: number;
    succeeded: TagWriteResult[];
    failed: BatchTagWriteFailure[];
}
