import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import 'server-only';

import { serverEnv } from '@/config/env.server';
import { isLosslessAudio } from '@/lib/media';
import { parseNumber } from '@/lib/number';

import { type ToolHealth, inspectNativeTool, resolveActiveEngine, toolHealthStatus } from '../tool-inspector';
import type { TechnicalAudioInfo } from '../types';

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;

interface FFprobeStream {
    codec_name?: string;
    codec_long_name?: string;
    codec_type?: string;
    duration?: string | number;
    bit_rate?: string | number;
    sample_rate?: string | number;
    channels?: number;
    channel_layout?: string;
    bits_per_sample?: number;
    bits_per_raw_sample?: string | number;
    disposition?: {
        attached_pic?: number;
    };
}

interface FFprobeRawOutput {
    streams?: FFprobeStream[];
    format?: {
        format_name?: string;
        format_long_name?: string;
        duration?: string | number;
        bit_rate?: string | number;
    };
}

function parseFFprobeVersion(output: string): string | null {
    return output.match(/ffprobe version\s+([^\s,]+)/i)?.[1] ?? null;
}

/**
 * FFprobe Technical Audio Stream Prober Adapter.
 * Inspects elementary audio streams, packet dispositions, and container attributes.
 */
export class FFprobeAdapter {
    private readonly binaryPath: string;

    constructor(binaryPath = serverEnv.FFPROBE_PATH) {
        this.binaryPath = binaryPath;
    }

    /**
     * Returns health diagnostics for this adapter.
     */
    public static async getToolHealth(): Promise<ToolHealth> {
        const native = await inspectNativeTool('ffprobe', serverEnv.FFPROBE_PATH, ['-version'], parseFFprobeVersion);

        const configured = serverEnv.PROBING_ENGINE;
        const active = resolveActiveEngine(configured, native.available, true);

        return {
            configured,
            active,
            implementations: {
                native,
                wasm: { available: true },
            },
            status: toolHealthStatus(configured, active, native.available, true),
        };
    }

    /**
     * Probes an audio file and returns normalized technical stream parameters.
     *
     * @param canonicalPath - Pre-authorized canonical absolute file path.
     */
    public async inspect(canonicalPath: string): Promise<TechnicalAudioInfo> {
        const args = ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', canonicalPath];

        let stdout: string;
        try {
            ({ stdout } = await execFileAsync(this.binaryPath, args, {
                timeout: DEFAULT_TIMEOUT_MS,
                maxBuffer: MAX_OUTPUT_BYTES,
                windowsHide: true,
            }));
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`FFprobe failed for "${path.basename(canonicalPath)}": ${msg}`);
        }

        try {
            const rawOutput = JSON.parse(stdout) as FFprobeRawOutput;
            return this.normalizeMetadata(rawOutput);
        } catch (error) {
            throw new Error(`FFprobe returned invalid JSON for "${path.basename(canonicalPath)}"`, { cause: error });
        }
    }

    private normalizeMetadata(raw: FFprobeRawOutput): TechnicalAudioInfo {
        const streams = raw.streams ?? [];
        const format = raw.format ?? {};

        const audioStream = streams.find((stream) => stream.codec_type === 'audio') ?? ({} as FFprobeStream);

        const codec = (audioStream.codec_name ?? 'unknown').toLowerCase();
        const codecLongName = audioStream.codec_long_name ?? codec.toUpperCase();
        const containerFormat = format.format_name ?? 'unknown';
        const containerLongName = format.format_long_name ?? containerFormat;

        const duration = parseNumber(format.duration ?? audioStream.duration);
        const bitrate = parseNumber(format.bit_rate ?? audioStream.bit_rate);
        const sampleRate = parseNumber(audioStream.sample_rate);
        const channels = parseNumber(audioStream.channels);

        let bitsPerSample = parseNumber(audioStream.bits_per_sample);
        if (bitsPerSample <= 0) {
            bitsPerSample = parseNumber(audioStream.bits_per_raw_sample);
        }

        const hasAttachedPicture = streams.some((stream) => Number(stream.disposition?.attached_pic) === 1);

        return {
            codec,
            codecLongName,
            containerFormat,
            containerLongName,
            duration: Math.max(0, duration),
            bitrate: Math.max(0, Math.trunc(bitrate)),
            sampleRate: Math.max(0, Math.trunc(sampleRate)),
            channels: Math.max(0, Math.trunc(channels)),
            channelLayout: audioStream.channel_layout,
            bitsPerSample: bitsPerSample > 0 ? Math.trunc(bitsPerSample) : undefined,
            isLossless: isLosslessAudio(codec, containerFormat),
            hasAttachedPicture,
            streamCount: streams.length,
            rawStreams: streams,
            rawFormat: format,
        };
    }
}
