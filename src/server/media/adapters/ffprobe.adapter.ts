import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import 'server-only';

import { serverEnv } from '@/config/env.server';
import { isLosslessAudio } from '@/lib/media';
import { parseFiniteInteger, parseFiniteNumber, parseString } from '@/lib/number';

import type { AudioStreamInfo, CoverArtInfo, FFprobeAudioStream, FFprobeCoverArt, FFprobeInspectionResult, FFprobeNormalizedResult } from '../types';

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 15000;
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;

export type FFprobeCodecType = 'audio' | 'video' | 'subtitle' | 'data' | 'attachment' | 'unknown';

export interface FFprobeRawOutput {
    streams?: FFprobeStream[];
    format?: {
        format_name?: string;
        format_long_name?: string;
        nb_streams?: number;
        duration?: string;
        size?: string;
        bit_rate?: string;
        probe_score?: number;
    };
}

export interface FFprobeStream {
    index: number;
    codec_type: FFprobeCodecType;

    codec_name?: string;
    codec_long_name?: string;
    codec_tag_string?: string;
    profile?: string;

    // Audio properties
    sample_fmt?: string;
    sample_rate?: string;
    channels?: number;
    channel_layout?: string;
    bits_per_sample?: number;
    bits_per_raw_sample?: string;
    bit_rate?: string;

    // Video properties
    width?: number;
    height?: number;
    sample_aspect_ratio?: string;
    display_aspect_ratio?: string;

    // Timing
    duration?: string;

    disposition?: {
        default?: number;
        attached_pic?: number;
    };

    tags?: Record<string, string>;
}

export type { FFprobeAudioStream, FFprobeCoverArt, FFprobeNormalizedResult, FFprobeInspectionResult };

export class FFprobeAdapter {
    private readonly binaryPath: string;

    constructor(binaryPath = serverEnv.FFPROBE_PATH) {
        this.binaryPath = binaryPath;
    }

    public normalizeResult(raw: FFprobeRawOutput): FFprobeNormalizedResult {
        const rawFormat = raw.format ?? {};
        const rawStreams = raw.streams ?? [];
        const formatDuration = parseFiniteNumber(rawFormat.duration);

        const format = {
            container: rawFormat.format_name ?? 'unknown',
            containerFormat: rawFormat.format_name,
            containerLongName: rawFormat.format_long_name,
            duration: formatDuration,
            bitRate: parseFiniteNumber(rawFormat.bit_rate),
            size: parseFiniteNumber(rawFormat.size) ?? 0,
            probeScore: rawFormat.probe_score,
        };

        const audio: AudioStreamInfo[] = rawStreams
            .filter((stream) => stream.codec_type === 'audio')
            .map((stream) => {
                const codec = stream.codec_name ?? 'unknown';
                const bitsPerSample = parseFiniteInteger(stream.bits_per_sample);
                const bitsPerRawSample = parseFiniteInteger(stream.bits_per_raw_sample);
                const bitDepth = bitsPerRawSample || bitsPerSample || undefined;
                const codecId = stream.codec_tag_string;

                return {
                    index: stream.index,
                    default: stream.disposition?.default === 1,

                    codec,
                    codecLongName: stream.codec_long_name,
                    codecId,
                    codecTag: codecId,
                    profile: stream.profile,

                    sampleFormat: stream.sample_fmt,
                    sampleRate: parseFiniteNumber(stream.sample_rate),

                    channels: stream.channels ?? 0,
                    channelLayout: stream.channel_layout,

                    bitDepth,
                    bitsPerSample: bitsPerSample ?? 0,
                    bitsPerRawSample,
                    bitRate: parseFiniteNumber(stream.bit_rate),

                    duration: parseFiniteNumber(stream.duration) ?? formatDuration,
                    streamSize: parseFiniteNumber(stream.tags?.NUMBER_OF_BYTES),
                    language: parseString(stream.tags?.language ?? stream.tags?.LANGUAGE),
                    isLossless: isLosslessAudio(codec),
                };
            });

        const coverArts: CoverArtInfo[] = rawStreams
            .filter((stream) => stream.disposition?.attached_pic === 1)
            .map((stream) => {
                const width = stream.width ?? 0;
                const height = stream.height ?? 0;
                const codec = stream.codec_name ?? 'unknown';
                const codecId = stream.codec_tag_string;

                return {
                    index: stream.index,
                    type: stream.tags?.comment ?? 'FrontCover',
                    typeString: stream.tags?.comment,

                    codec,
                    codecLongName: stream.codec_long_name,
                    codecId,
                    codecTag: codecId,
                    profile: stream.profile,

                    width,
                    height,
                    aspectRatio: width && height ? Number((width / height).toFixed(6)) : undefined,

                    mimeType: codec === 'mjpeg' || codec === 'jpeg' ? 'image/jpeg' : codec === 'png' ? 'image/png' : undefined,

                    sampleAspectRatio: stream.sample_aspect_ratio,
                    displayAspectRatio: stream.display_aspect_ratio,
                };
            });

        const hasAudio = audio.length > 0;
        const hasCoverArt = coverArts.length > 0;

        return {
            ...format,
            isLossless: audio.some((stream) => stream.isLossless),
            hasAudio,
            hasCoverArt,
            coverArts,
            audio,
        };
    }

    public async inspect(canonicalPath: string): Promise<FFprobeInspectionResult> {
        const args = ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', canonicalPath];

        try {
            const { stdout } = await execFileAsync(this.binaryPath, args, {
                timeout: DEFAULT_TIMEOUT_MS,
                maxBuffer: MAX_OUTPUT_BYTES,
                windowsHide: true,
            });

            const raw = JSON.parse(stdout) as FFprobeRawOutput;
            return { ...this.normalizeResult(raw), raw };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            throw new Error(`FFprobe failed for "${path.basename(canonicalPath)}": ${message}`, { cause: error });
        }
    }
}
