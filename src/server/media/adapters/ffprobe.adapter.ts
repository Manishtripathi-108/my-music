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

export interface FFprobeOutput {
    streams: FFprobeStream[];
    format: {
        format_name: string;
        format_long_name?: string;

        nb_streams: number;

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

export class FFprobeAdapter {
    private readonly binaryPath: string;

    constructor(binaryPath = serverEnv.FFPROBE_PATH) {
        this.binaryPath = binaryPath;
    }

    public async inspect(canonicalPath: string) {
        const args = ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', canonicalPath];

        let stdout: string;

        try {
            ({ stdout } = await execFileAsync(this.binaryPath, args, {
                timeout: DEFAULT_TIMEOUT_MS,
                maxBuffer: MAX_OUTPUT_BYTES,
                windowsHide: true,
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            throw new Error(`FFprobe failed for "${path.basename(canonicalPath)}": ${message}`, { cause: error });
        }

        let raw: FFprobeOutput;

        try {
            raw = JSON.parse(stdout) as FFprobeOutput;
        } catch (error) {
            throw new Error(`FFprobe returned invalid JSON for "${path.basename(canonicalPath)}"`, { cause: error });
        }

        return { ...this.normalizeMetadata(raw), raw };
    }

    private normalizeMetadata(raw: FFprobeOutput) {
        const formatDuration = parseFiniteNumber(raw.format.duration);

        const format = {
            container: raw.format.format_name,
            containerLongName: raw.format.format_long_name,
            duration: formatDuration,
            bitRate: parseFiniteNumber(raw.format.bit_rate),
            size: parseFiniteNumber(raw.format.size) ?? 0,
            streamCount: raw.format.nb_streams,
            probeScore: raw.format.probe_score,
        };

        const audio = raw.streams
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

        const coverArts = raw.streams
            .filter((stream) => stream.disposition?.attached_pic === 1)
            .map((stream) => ({
                index: stream.index,
                type: stream.tags?.comment ?? 'unknown',

                codec: stream.codec_name ?? 'unknown',
                codecLongName: stream.codec_long_name,
                profile: stream.profile,

                width: stream.width ?? 0,
                height: stream.height ?? 0,

                aspectRatio: stream.sample_aspect_ratio,
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
}
