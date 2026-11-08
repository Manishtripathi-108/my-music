import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import 'server-only';

import { serverEnv } from '@/config/env.server';
import { isLosslessAudio } from '@/lib/media';
import { parseBoolean, parseFiniteInteger, parseFiniteNumber, parseString } from '@/lib/number';

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 15000;
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;

type MediaInfoRecord = Record<string, unknown>;

export interface MediaInfoAudioTrack {
    streamKindId?: number;
    streamPosition?: number;
    streamOrder?: number;

    id?: string;
    uniqueId?: string;

    codec: string;
    format?: string;
    codecLongName?: string;
    formatCommercial?: string;
    codecId?: string;
    codecIdDescription?: string;
    profile?: string;
    formatVersion?: string;
    formatSettings?: string;
    additionalFeatures?: string;
    internetMediaType?: string;
    muxingMode?: string;

    bitRate?: number;
    bitRateEncoded?: number;
    bitRateMinimum?: number;
    bitRateMaximum?: number;
    bitRateNominal?: number;
    bitRateMode?: string;
    bitRateModeLabel?: string;

    channels?: number;
    channelsOriginal?: number;
    channelLayout?: string;
    channelLayoutOriginal?: string;
    channelPositions?: string;
    channelPositionsOriginal?: string;
    channelPositionsString2?: string;

    sampleRate?: number;
    sampleCount?: number;

    bitDepth?: number;
    bitDepthDetected?: number;
    bitDepthStored?: number;

    compressionMode?: string;
    compressionRatio?: number;

    duration?: number;
    durationFirstFrame?: number;
    durationLastFrame?: number;

    streamSize?: number;
    streamSizeEncoded?: number;
    streamSizeDemuxed?: number;
    streamSizeProportion?: number;

    language?: string;
    default?: boolean;
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

    isLossless: boolean;
}

export interface MediaInfoImageTrack {
    streamKindId?: number;
    streamPosition?: number;
    streamOrder?: number;

    uniqueId?: string;

    type?: string;
    typeString?: string;

    format: string;
    formatName?: string;
    codecId?: string;
    codecIdDescription?: string;
    profile?: string;
    formatVersion?: string;
    formatSettings?: string;
    internetMediaType?: string;
    muxingMode?: string;

    width?: number;
    height?: number;

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

    id?: string;
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

    trackCount: number;
    streamCount: number;

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

    return {
        streamKindId: parseFiniteInteger(track['StreamKindID']),
        streamPosition: parseFiniteInteger(track['StreamKindPos']),
        streamOrder: parseFiniteInteger(track['StreamOrder']),

        uniqueId: parseString(track['UniqueID']),

        codec,
        format,
        codecLongName: parseString(track['Format_Info']) ?? parseString(track['Format_Commercial']) ?? parseString(track['Format_String']),
        formatCommercial: parseString(track['Format_Commercial']),
        codecId: parseString(track['CodecID']),
        codecIdDescription: parseString(track['CodecID_Description']),
        profile: parseString(track['Format_Profile']),
        formatVersion: parseString(track['Format_Version']),
        formatSettings: parseString(track['Format_Settings']),
        additionalFeatures: parseString(track['Format_AdditionalFeatures']),
        internetMediaType: parseString(track['InternetMediaType']),
        muxingMode: parseString(track['MuxingMode']),

        bitRate: parseFiniteNumber(track['BitRate']),
        bitRateEncoded: parseFiniteNumber(track['BitRate_Encoded']),
        bitRateMinimum: parseFiniteNumber(track['BitRate_Minimum']),
        bitRateMaximum: parseFiniteNumber(track['BitRate_Maximum']),
        bitRateNominal: parseFiniteNumber(track['BitRate_Nominal']),
        bitRateMode: parseString(track['BitRate_Mode']),
        bitRateModeLabel: parseString(track['BitRate_Mode_String']),

        channels: parseFiniteInteger(track['Channels']),
        channelsOriginal: parseFiniteInteger(track['Channels_Original']),
        channelLayout: parseString(track['ChannelLayout']),
        channelLayoutOriginal: parseString(track['ChannelLayout_Original']),
        channelPositions: parseString(track['ChannelPositions']),
        channelPositionsOriginal: parseString(track['ChannelPositions_Original']),
        channelPositionsString2: parseString(track['ChannelPositions_String2']),

        sampleRate: parseFiniteNumber(track['SamplingRate']),
        sampleCount: parseFiniteNumber(track['SamplingCount']),

        bitDepth: parseFiniteInteger(track['BitDepth']),
        bitDepthDetected: parseFiniteInteger(track['BitDepth_Detected']),
        bitDepthStored: parseFiniteInteger(track['BitDepth_Stored']),

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

        audioMd5: parseString(track?.extra?.MD5_Unencoded),

        isLossless: isLosslessAudio(codec, containerFormat, compressionMode),
    };
}

function normalizeImageTrack(track: MediaInfoRecord): MediaInfoImageTrack {
    const format = parseString(track['Format']);
    const width = parseFiniteInteger(track['Width']);
    const height = parseFiniteInteger(track['Height']);

    const type = parseString(track['Type']);
    const typeString = parseString(track['Type_String']);

    return {
        streamKindId: parseFiniteInteger(track['StreamKindID']),
        streamPosition: parseFiniteInteger(track['StreamKindPos']),
        streamOrder: parseFiniteInteger(track['StreamOrder']),

        uniqueId: parseString(track['UniqueID']),

        type,
        typeString,

        format: normalizeIdentifier(format) ?? 'unknown',
        formatName: format,
        codecId: parseString(track['CodecID']),
        codecIdDescription: parseString(track['CodecID_Description']),
        profile: parseString(track['Format_Profile']),
        formatVersion: parseString(track['Format_Version']),
        formatSettings: parseString(track['Format_Settings']),
        internetMediaType: parseString(track['InternetMediaType']),
        muxingMode: parseString(track['MuxingMode']),

        width,
        height,

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

export class MediaInfoAdapter {
    private readonly binaryPath: string;

    constructor(binaryPath = serverEnv.MEDIAINFO_PATH) {
        this.binaryPath = binaryPath;
    }

    private normalizeResult(raw: unknown): MediaInfoNormalizedResult {
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
                ...this.normalizeResult(raw),
                raw,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            throw new Error(`MediaInfo failed for "${path.basename(canonicalPath)}": ${message}`, { cause: error });
        }
    }
}
