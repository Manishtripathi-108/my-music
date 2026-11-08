import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import 'server-only';

import { serverEnv } from '@/config/env.server';
import { isLosslessAudio } from '@/lib/media';
import { parseFiniteNumber } from '@/lib/number';

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

export interface FFprobeAudioStream {
    index: number;
    default: boolean;

    codec: string;
    codecLongName?: string;
    codecTag?: string;
    profile?: string;

    sampleFormat?: string;
    sampleRate?: number;

    channels: number;
    channelLayout?: string;

    bitsPerSample: number;
    bitsPerRawSample?: number;
    bitRate?: number;

    duration?: number;
    isLossless: boolean;
}

export interface FFprobeCoverArt {
    index: number;
    type: string;

    codec: string;
    codecLongName?: string;
    profile?: string;

    width: number;
    height: number;

    aspectRatio?: number;
    sampleAspectRatio?: string;
    displayAspectRatio?: string;
}

export interface FFprobeNormalizedResult {
    container: string;
    containerLongName?: string;
    duration?: number;
    bitRate?: number;
    size: number;
    streamCount: number;
    probeScore?: number;
    isLossless: boolean;
    hasAudio: boolean;
    hasCoverArt: boolean;
    coverArts: FFprobeCoverArt[];
    audio: FFprobeAudioStream[];
}

export interface FFprobeInspectionResult extends FFprobeNormalizedResult {
    raw: FFprobeRawOutput;
}

export class FFprobeAdapter {
    private readonly binaryPath: string;

    constructor(binaryPath = serverEnv.FFPROBE_PATH) {
        this.binaryPath = binaryPath;
    }

    private normalizeResult(raw: FFprobeRawOutput): FFprobeNormalizedResult {
        const rawFormat = raw.format ?? {};
        const rawStreams = raw.streams ?? [];
        const formatDuration = parseFiniteNumber(rawFormat.duration);

        const format = {
            container: rawFormat.format_name ?? 'unknown',
            containerLongName: rawFormat.format_long_name,
            duration: formatDuration,
            bitRate: parseFiniteNumber(rawFormat.bit_rate),
            size: parseFiniteNumber(rawFormat.size) ?? 0,
            streamCount: rawFormat.nb_streams ?? rawStreams.length,
            probeScore: rawFormat.probe_score,
        };

        const audio: FFprobeAudioStream[] = rawStreams
            .filter((stream) => stream.codec_type === 'audio')
            .map((stream) => {
                const codec = stream.codec_name ?? 'unknown';

                return {
                    index: stream.index,
                    default: stream.disposition?.default === 1,

                    codec,
                    codecLongName: stream.codec_long_name,
                    codecTag: stream.codec_tag_string,
                    profile: stream.profile,

                    sampleFormat: stream.sample_fmt,
                    sampleRate: parseFiniteNumber(stream.sample_rate),

                    channels: stream.channels ?? 0,
                    channelLayout: stream.channel_layout,

                    bitsPerSample: stream.bits_per_sample ?? 0,
                    bitsPerRawSample: parseFiniteNumber(stream.bits_per_raw_sample),
                    bitRate: parseFiniteNumber(stream.bit_rate),

                    duration: parseFiniteNumber(stream.duration) ?? formatDuration,
                    isLossless: isLosslessAudio(codec),
                };
            });

        const coverArts: FFprobeCoverArt[] = rawStreams
            .filter((stream) => stream.disposition?.attached_pic === 1)
            .map((stream) => ({
                index: stream.index,
                type: stream.tags?.comment ?? 'unknown',

                codec: stream.codec_name ?? 'unknown',
                codecLongName: stream.codec_long_name,
                profile: stream.profile,

                width: stream.width ?? 0,
                height: stream.height ?? 0,

                aspectRatio: stream.width && stream.height ? Number((stream.width / stream.height).toFixed(6)) : undefined,

                sampleAspectRatio: stream.sample_aspect_ratio,
                displayAspectRatio: stream.display_aspect_ratio,
            }));

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
