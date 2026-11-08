import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import type { MediaInfo } from 'mediainfo.js';
import 'server-only';

import { serverEnv } from '@/config/env.server';
import { isLosslessAudio } from '@/lib/media';
import { parseBoolean, parseFiniteInteger, parseFiniteNumber, parseString } from '@/lib/number';

import type {
    MediaInfoAudioTrack,
    MediaInfoImageTrack,
    MediaInfoInspectionResult,
    MediaInfoNormalizedResult,
    MediaInfoOtherStream,
    MediaInfoStreamCounts,
} from '../types';

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 15000;
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;
const DEFAULT_WASM_POOL_SIZE = 8;

type MediaInfoRecord = Record<string, unknown>;

export type {
    MediaInfoAudioTrack,
    MediaInfoImageTrack,
    MediaInfoInspectionResult,
    MediaInfoNormalizedResult,
    MediaInfoOtherStream,
    MediaInfoStreamCounts,
};

function asRecord(value: unknown): MediaInfoRecord | undefined {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return undefined;
    }

    return value as MediaInfoRecord;
}

function normalizeIdentifier(value: string | undefined): string | undefined {
    return value?.trim().toLowerCase() || undefined;
}

function readTrackType(record: MediaInfoRecord): string | undefined {
    return normalizeIdentifier(parseString(record['@type']));
}

function normalizeAudioTrack(track: MediaInfoRecord): MediaInfoAudioTrack {
    const format = parseString(track['Format']);
    const codec = normalizeIdentifier(format) ?? 'unknown';
    const compressionMode = parseString(track['Compression_Mode']);
    const containerFormat = parseString(track['ContainerFormat']) ?? parseString(track['MuxingMode']);
    const extra = asRecord(track['extra']);

    const bitDepth = parseFiniteInteger(track['BitDepth']);
    const bitDepthDetected = parseFiniteInteger(track['BitDepth_Detected']);
    const bitDepthStored = parseFiniteInteger(track['BitDepth_Stored']);

    const bitRate = parseFiniteNumber(track['BitRate']);
    const bitRateMode = parseString(track['BitRate_Mode']);
    const bitRateModeLabel = parseString(track['BitRate_Mode_String']);

    const channels = parseFiniteInteger(track['Channels']) ?? 0;
    const codecId = parseString(track['CodecID']);

    const streamIndex =
        parseFiniteInteger(track['StreamOrder']) ??
        parseFiniteInteger(track['StreamKindPos']) ??
        parseFiniteInteger(track['StreamKindID']) ??
        0;

    return {
        index: streamIndex,
        streamKindId: parseFiniteInteger(track['StreamKindID']),
        streamPosition: parseFiniteInteger(track['StreamKindPos']),
        streamOrder: parseFiniteInteger(track['StreamOrder']),

        uniqueId: parseString(track['UniqueID']),

        codec,
        format,
        codecLongName: parseString(track['Format_Info']) ?? parseString(track['Format_Commercial']) ?? parseString(track['Format_String']),
        formatCommercial: parseString(track['Format_Commercial']),
        codecId,
        codecTag: codecId,
        codecIdDescription: parseString(track['CodecID_Description']),
        profile: parseString(track['Format_Profile']),
        formatVersion: parseString(track['Format_Version']),
        formatSettings: parseString(track['Format_Settings']),
        sampleFormat: parseString(track['Format_Settings']) ?? parseString(track['Format_Profile']),
        additionalFeatures: parseString(track['Format_AdditionalFeatures']),
        internetMediaType: parseString(track['InternetMediaType']),
        muxingMode: parseString(track['MuxingMode']),

        bitRate,
        bitRateMode,
        bitRateModeLabel,
        bitRateEncoded: parseFiniteNumber(track['BitRate_Encoded']),
        bitRateMinimum: parseFiniteNumber(track['BitRate_Minimum']),
        bitRateMaximum: parseFiniteNumber(track['BitRate_Maximum']),
        bitRateNominal: parseFiniteNumber(track['BitRate_Nominal']),

        channels,
        channelsOriginal: parseFiniteInteger(track['Channels_Original']),
        channelLayout: parseString(track['ChannelLayout']),
        channelLayoutOriginal: parseString(track['ChannelLayout_Original']),
        channelPositions: parseString(track['ChannelPositions']),
        channelPositionsOriginal: parseString(track['ChannelPositions_Original']),
        channelPositionsString2: parseString(track['ChannelPositions_String2']),

        sampleRate: parseFiniteNumber(track['SamplingRate']),
        sampleCount: parseFiniteNumber(track['SamplingCount']),

        bitDepth,
        bitsPerSample: bitDepth,
        bitsPerRawSample: bitDepthDetected ?? bitDepthStored ?? bitDepth,
        bitDepthDetected,
        bitDepthStored,

        compressionMode,
        compressionRatio: parseFiniteNumber(track['Compression_Ratio']),

        duration: parseFiniteNumber(track['Duration']),
        durationFirstFrame: parseFiniteNumber(track['Duration_FirstFrame']),
        durationLastFrame: parseFiniteNumber(track['Duration_LastFrame']),

        streamSize: parseFiniteNumber(track['StreamSize']),
        streamSizeEncoded: parseFiniteNumber(track['StreamSize_Encoded']),
        streamSizeDemuxed: parseFiniteNumber(track['StreamSize_Demuxed']),
        streamSizeProportion: parseFiniteNumber(track['StreamSize_Proportion']),

        language: parseString(track['Language']),
        default: parseBoolean(track['Default']),
        forced: parseBoolean(track['Forced']),
        disabled: parseBoolean(track['Disabled']),

        encodedLibrary: parseString(track['Encoded_Library']),
        encodedLibraryString: parseString(track['Encoded_Library_String']),
        encodedLibraryName: parseString(track['Encoded_Library_Name']),
        encodedLibraryVersion: parseString(track['Encoded_Library_Version']),
        encodedLibrarySettings: parseString(track['Encoded_Library_Settings']),

        encodedApplication: parseString(track['Encoded_Application']),
        encodedApplicationVersion: parseString(track['Encoded_Application_Version']),

        audioMd5: parseString(extra?.['MD5_Unencoded']),

        isLossless: isLosslessAudio(codec, containerFormat, compressionMode),
    };
}

function normalizeImageTrack(track: MediaInfoRecord): MediaInfoImageTrack {
    const format = parseString(track['Format']);
    const width = parseFiniteInteger(track['Width']);
    const height = parseFiniteInteger(track['Height']);
    const codec = normalizeIdentifier(format) ?? 'unknown';
    const codecId = parseString(track['CodecID']);

    const streamIndex =
        parseFiniteInteger(track['StreamOrder']) ??
        parseFiniteInteger(track['StreamKindPos']) ??
        parseFiniteInteger(track['StreamKindID']) ??
        0;

    return {
        index: streamIndex,
        streamKindId: parseFiniteInteger(track['StreamKindID']),
        streamPosition: parseFiniteInteger(track['StreamKindPos']),
        streamOrder: parseFiniteInteger(track['StreamOrder']),

        uniqueId: parseString(track['UniqueID']),

        type: parseString(track['Type']),
        typeString: parseString(track['Type_String']),

        codec,
        codecLongName: parseString(track['Format_Info']),
        codecId,
        codecTag: codecId,
        format: codec,
        formatName: format,
        codecIdDescription: parseString(track['CodecID_Description']),
        profile: parseString(track['Format_Profile']),
        formatVersion: parseString(track['Format_Version']),
        formatSettings: parseString(track['Format_Settings']),
        internetMediaType: parseString(track['InternetMediaType']),
        mimeType: parseString(track['InternetMediaType']),
        muxingMode: parseString(track['MuxingMode']),

        width,
        height,
        aspectRatio: width && height ? Number((width / height).toFixed(6)) : undefined,

        colorSpace: parseString(track['ColorSpace']),
        chromaSubsampling: parseString(track['ChromaSubsampling']),
        bitDepth: parseFiniteInteger(track['BitDepth']),
        compressionMode: parseString(track['Compression_Mode']),
        compressionRatio: parseFiniteNumber(track['Compression_Ratio']),

        colorDescriptionPresent: parseString(track['colour_description_present']),
        colorPrimaries: parseString(track['colour_primaries']),
        colorRange: parseString(track['colour_range']),
        matrixCoefficients: parseString(track['matrix_coefficients']),
        transferCharacteristics: parseString(track['transfer_characteristics']),

        streamSize: parseFiniteNumber(track['StreamSize']),
        streamSizeProportion: parseFiniteNumber(track['StreamSize_Proportion']),

        default: parseBoolean(track['Default']),
        forced: parseBoolean(track['Forced']),
        disabled: parseBoolean(track['Disabled']),
    };
}

function normalizeOtherStream(track: MediaInfoRecord): MediaInfoOtherStream {
    return {
        type: readTrackType(track) ?? 'unknown',
        streamKindId: parseFiniteInteger(track['StreamKindID']),
        streamPosition: parseFiniteInteger(track['StreamKindPos']),
        streamOrder: parseFiniteInteger(track['StreamOrder']),

        format: normalizeIdentifier(parseString(track['Format'])),
        codecId: parseString(track['CodecID']),
        codecLongName: parseString(track['Format_Info']),

        duration: parseFiniteNumber(track['Duration']),
        streamSize: parseFiniteNumber(track['StreamSize']),

        width: parseFiniteInteger(track['Width']),
        height: parseFiniteInteger(track['Height']),
        channels: parseFiniteInteger(track['Channels']),
        sampleRate: parseFiniteNumber(track['SamplingRate']),

        language: parseString(track['Language']),
    };
}

export function normalizeMediaInfoResult(raw: unknown): MediaInfoNormalizedResult {
    const root = asRecord(raw);

    if (!root) {
        throw new TypeError('Invalid MediaInfo JSON output');
    }

    const media = asRecord(root.media);

    const trackValues = Array.isArray(media?.track) ? media.track : Array.isArray(root.rawTracks) ? root.rawTracks : undefined;

    if (!trackValues) {
        throw new TypeError('MediaInfo output does not contain a track array');
    }

    const tracks = trackValues.map(asRecord).filter((track): track is MediaInfoRecord => track !== undefined);

    if (tracks.length === 0) {
        throw new TypeError('MediaInfo returned no valid tracks');
    }

    const general = tracks.find((track) => readTrackType(track) === 'general') ?? {};

    const audioTracks = tracks.filter((track) => readTrackType(track) === 'audio');

    const imageTracks = tracks.filter((track) => readTrackType(track) === 'image');

    const streamTracks = tracks.filter((track) => readTrackType(track) !== 'general');

    const audio = audioTracks.map(normalizeAudioTrack);
    const coverArts = imageTracks.map(normalizeImageTrack);

    const otherStreams = streamTracks
        .filter((track) => {
            const type = readTrackType(track);

            return type !== 'audio' && type !== 'image';
        })
        .map(normalizeOtherStream);

    const countTracks = (type: string) => streamTracks.filter((track) => readTrackType(track) === type).length;

    const streamCounts: MediaInfoStreamCounts = {
        total: streamTracks.length,
        audio: audio.length,
        image: coverArts.length,
        video: countTracks('video'),
        text: countTracks('text'),
        menu: countTracks('menu'),
        other: countTracks('other'),
        unknown: streamTracks.filter((track) => readTrackType(track) === undefined).length,
    };

    const duration = parseFiniteNumber(general['Duration']) ?? audio.find((stream) => stream.duration !== undefined)?.duration;

    const format = parseString(general['Format']);

    return {
        container: normalizeIdentifier(format) ?? 'unknown',
        containerFormat: format,
        containerLongName: parseString(general['Format_Info']) ?? parseString(general['Format_Commercial']),
        containerCommercial: parseString(general['Format_Commercial']),
        containerProfile: parseString(general['Format_Profile']),
        containerVersion: parseString(general['Format_Version']),
        containerCodecId: parseString(general['CodecID']),
        mimeType: parseString(general['InternetMediaType']),

        duration,
        bitRate: parseFiniteNumber(general['OverallBitRate']),
        bitRateMode: parseString(general['OverallBitRate_Mode']),
        bitRateModeLabel: parseString(general['OverallBitRate_Mode_String']),
        bitRateMinimum: parseFiniteNumber(general['OverallBitRate_Minimum']),
        bitRateMaximum: parseFiniteNumber(general['OverallBitRate_Maximum']),
        bitRateNominal: parseFiniteNumber(general['OverallBitRate_Nominal']),

        size: parseFiniteNumber(general['FileSize']),
        dataSize: parseFiniteNumber(general['DataSize']),
        headerSize: parseFiniteNumber(general['HeaderSize']),
        footerSize: parseFiniteNumber(general['FooterSize']),

        isStreamable: parseBoolean(general['IsStreamable']),
        audioChannelsTotal: parseFiniteInteger(general['Audio_Channels_Total']),

        streamCounts,

        hasAudio: audio.length > 0,
        hasCoverArt: coverArts.length > 0,
        isLossless: audio.length > 0 && audio.every((stream) => stream.isLossless),

        audio,
        coverArts,
        otherStreams,
    };
}

export class MediaInfoNativeAdapter {
    private readonly binaryPath: string;

    constructor(binaryPath = serverEnv.MEDIAINFO_PATH) {
        this.binaryPath = binaryPath;
    }

    public async inspect(canonicalPath: string): Promise<MediaInfoInspectionResult> {
        const args = ['--Output=JSON', '--Full', canonicalPath];

        try {
            const { stdout } = await execFileAsync(this.binaryPath, args, {
                timeout: DEFAULT_TIMEOUT_MS,
                maxBuffer: MAX_OUTPUT_BYTES,
                windowsHide: true,
            });

            const output = stdout
                .toString()
                .replace(/^\uFEFF/, '')
                .trim();

            if (!output) {
                throw new Error('MediaInfo returned empty output');
            }

            const raw: unknown = JSON.parse(output);

            return {
                ...normalizeMediaInfoResult(raw),
                raw,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            throw new Error(`MediaInfo failed for "${path.basename(canonicalPath)}": ${message}`, { cause: error });
        }
    }
}

/**
 * High-performance instance pool for MediaInfo WASM analyzers.
 * Guarantees bounded concurrency and prevents the Emscripten "isAnalyzing" collision.
 */
class MediaInfoWasmPool {
    private readonly maxSize: number;
    private readonly pool: MediaInfo<'object'>[] = [];
    private activeCount = 0;
    private readonly waitQueue: Array<(instance: MediaInfo<'object'>) => void> = [];

    constructor(maxSize = DEFAULT_WASM_POOL_SIZE) {
        this.maxSize = maxSize;
    }

    private async createInstance(): Promise<MediaInfo<'object'>> {
        const { default: mediaInfoFactory } = await import('mediainfo.js');
        return mediaInfoFactory({ format: 'object', full: true });
    }

    public async acquire(): Promise<MediaInfo<'object'>> {
        if (this.pool.length > 0) {
            return this.pool.pop()!;
        }

        if (this.activeCount < this.maxSize) {
            this.activeCount++;
            try {
                return await this.createInstance();
            } catch (error) {
                this.activeCount--;
                throw error;
            }
        }

        return new Promise<MediaInfo<'object'>>((resolve) => {
            this.waitQueue.push(resolve);
        });
    }

    public release(instance: MediaInfo<'object'>): void {
        const next = this.waitQueue.shift();
        if (next) {
            next(instance);
        } else {
            this.pool.push(instance);
        }
    }

    public async withInstance<T>(fn: (instance: MediaInfo<'object'>) => Promise<T>): Promise<T> {
        const instance = await this.acquire();
        try {
            return await fn(instance);
        } finally {
            this.release(instance);
        }
    }

    public closeAll(): void {
        while (this.pool.length > 0) {
            const instance = this.pool.pop();
            try {
                instance?.close();
            } catch {
                // Ignore closing errors on shutdown
            }
        }
        this.activeCount = 0;
    }
}

const defaultWasmPool = new MediaInfoWasmPool();

export class MediaInfoWasmAdapter {
    private readonly pool: MediaInfoWasmPool;

    constructor(pool = defaultWasmPool) {
        this.pool = pool;
    }

    public async inspect(canonicalPath: string): Promise<MediaInfoInspectionResult> {
        let fileHandle: fs.promises.FileHandle | null = null;

        try {
            fileHandle = await fs.promises.open(canonicalPath, 'r');
            const fileStats = await fileHandle.stat();

            if (fileStats.size === 0) {
                throw new Error('MediaInfo WASM failed: file is empty');
            }

            const raw = await this.pool.withInstance(async (mediainfo) => {
                const readChunk = async (size: number, offset: number): Promise<Uint8Array> => {
                    const buffer = Buffer.alloc(size);
                    const { bytesRead } = await fileHandle!.read(buffer, 0, size, offset);
                    return buffer.subarray(0, bytesRead);
                };

                return mediainfo.analyzeData(fileStats.size, readChunk);
            });

            return {
                ...normalizeMediaInfoResult(raw),
                raw,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`MediaInfo WASM failed for "${path.basename(canonicalPath)}": ${message}`, { cause: error });
        } finally {
            if (fileHandle) {
                await fileHandle.close().catch(() => {});
            }
        }
    }
}

/**
 * Unified Quality-Control Adapter.
 * Dispatches to native MediaInfo CLI or pooled MediaInfo WASM according to PROBING_ENGINE,
 * with seamless fallback if the primary engine encounters a failure.
 */
export class MediaInfoAdapter {
    private readonly nativeAdapter: MediaInfoNativeAdapter;
    private readonly wasmAdapter: MediaInfoWasmAdapter;

    constructor(
        binaryPath = serverEnv.MEDIAINFO_PATH,
        wasmAdapter = new MediaInfoWasmAdapter()
    ) {
        this.nativeAdapter = new MediaInfoNativeAdapter(binaryPath);
        this.wasmAdapter = wasmAdapter;
    }

    public async inspect(canonicalPath: string): Promise<MediaInfoInspectionResult> {
        const configured = serverEnv.PROBING_ENGINE;

        if (configured === 'wasm') {
            try {
                return await this.wasmAdapter.inspect(canonicalPath);
            } catch (wasmError) {
                try {
                    return await this.nativeAdapter.inspect(canonicalPath);
                } catch {
                    throw wasmError;
                }
            }
        }

        try {
            return await this.nativeAdapter.inspect(canonicalPath);
        } catch (nativeError) {
            try {
                return await this.wasmAdapter.inspect(canonicalPath);
            } catch {
                throw nativeError;
            }
        }
    }

    public normalizeResult(raw: unknown) {
        return normalizeMediaInfoResult(raw);
    }
}
