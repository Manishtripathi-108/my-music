import { execFile } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import 'server-only';

import { serverEnv } from '@/config/env.server';

import type { TechnicalAudioInfo } from '../types';
import type { AudioProberOptions, FFprobeRawOutput, FFprobeStream } from './types';

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_CONCURRENCY = 8;
const MAX_CONCURRENCY = 8;
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;

const LOSSLESS_CODECS = new Set([
    'flac',
    'alac',
    'pcm_s16le',
    'pcm_s16be',
    'pcm_s24le',
    'pcm_s24be',
    'pcm_s32le',
    'pcm_s32be',
    'pcm_f32le',
    'pcm_f32be',
    'pcm_f64le',
    'pcm_f64be',
    'dsd_lsbf',
    'dsd_msbf',
    'dsd_lsbf_planar',
    'dsd_msbf_planar',
    'ape',
    'wavpack',
    'truehd',
    'mlp',
    'tak',
    'shorten',
]);

type ProbeError = Error & {
    code?: string | number;
    stderr?: string;
};

/**
 * Reads technical audio properties via FFprobe.
 * Isolates child-process execution and stream parsing from callers.
 */
export class AudioProber {
    private readonly binaryPath: string;
    private readonly timeoutMs: number;

    constructor(options: AudioProberOptions = {}) {
        this.binaryPath = options.binaryPath ?? serverEnv.FFPROBE_PATH ?? 'ffprobe';

        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

        if (!this.binaryPath.trim()) {
            throw new Error('FFprobe binary path cannot be empty.');
        }

        if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0) {
            throw new Error('FFprobe timeout must be greater than 0.');
        }
    }

    /** Probes one audio file and returns normalized technical metadata. */
    public async inspect(filePath: string): Promise<TechnicalAudioInfo> {
        const absolutePath = await this.resolveFile(filePath);

        const args = ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', absolutePath];

        let stdout: string;

        try {
            ({ stdout } = await execFileAsync(this.binaryPath, args, {
                timeout: this.timeoutMs,
                maxBuffer: MAX_OUTPUT_BYTES,
                windowsHide: true,
            }));
        } catch (error) {
            throw this.createProbeError(absolutePath, error);
        }

        try {
            const rawOutput = JSON.parse(stdout) as FFprobeRawOutput;
            return this.normalizeMetadata(rawOutput);
        } catch (error) {
            throw new Error(`FFprobe returned invalid JSON for "${path.basename(absolutePath)}".`, { cause: error });
        }
    }

    /** Probes multiple files with bounded process concurrency. */
    public async inspectBatch(filePaths: string[], concurrency = DEFAULT_CONCURRENCY): Promise<Map<string, TechnicalAudioInfo>> {
        const results = new Map<string, TechnicalAudioInfo>();

        if (filePaths.length === 0) {
            throw new Error('No audio files provided for batch inspection.');
        }

        const workerCount = this.getWorkerCount(concurrency, filePaths.length);

        let nextIndex = 0;

        const runWorker = async (): Promise<void> => {
            while (true) {
                const currentIndex = nextIndex++;
                const currentPath = filePaths[currentIndex];

                if (currentPath === undefined) {
                    return;
                }

                try {
                    const metadata = await this.inspect(currentPath);
                    results.set(path.resolve(currentPath), metadata);
                } catch (error) {
                    console.warn(`[AudioProber] Skipping "${currentPath}": ${this.getErrorMessage(error)}`);
                }
            }
        };

        await Promise.all(Array.from({ length: workerCount }, () => runWorker()));

        return results;
    }

    /** Converts FFprobe output into the application's metadata shape. */
    private normalizeMetadata(raw: FFprobeRawOutput): TechnicalAudioInfo {
        const streams = raw.streams ?? [];
        const format = raw.format ?? {};

        const audioStream = streams.find((stream) => stream.codec_type === 'audio') ?? ({} as FFprobeStream);

        const codec = (audioStream.codec_name ?? 'unknown').toLowerCase();

        const codecLongName = audioStream.codec_long_name ?? codec.toUpperCase();

        const containerFormat = format.format_name ?? 'unknown';

        const containerLongName = format.format_long_name ?? containerFormat;

        const duration = this.parseNumber(format.duration ?? audioStream.duration);

        const bitrate = this.parseNumber(format.bit_rate ?? audioStream.bit_rate);

        const sampleRate = this.parseNumber(audioStream.sample_rate);

        const channels = this.parseNumber(audioStream.channels);

        const bitsPerSample = this.getBitsPerSample(audioStream);

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
            bitsPerSample,
            isLossless: this.isLosslessCodec(codec, containerFormat),
            hasAttachedPicture,
            streamCount: streams.length,
            rawStreams: streams,
            rawFormat: format,
        };
    }

    /** Resolves the path and verifies that the target file is accessible. */
    private async resolveFile(filePath: string): Promise<string> {
        const absolutePath = path.resolve(filePath);

        try {
            await access(absolutePath);
        } catch (error) {
            throw new Error(`Audio file not found or inaccessible: ${absolutePath}`, { cause: error });
        }

        return absolutePath;
    }

    /** Returns the most useful available audio bit depth. */
    private getBitsPerSample(stream: FFprobeStream): number | undefined {
        const sampleBits = this.parseNumber(stream.bits_per_sample);

        if (sampleBits > 0) {
            return Math.trunc(sampleBits);
        }

        const rawBits = this.parseNumber(stream.bits_per_raw_sample);

        return rawBits > 0 ? Math.trunc(rawBits) : undefined;
    }

    /** Checks whether the detected codec should be treated as lossless. */
    private isLosslessCodec(codec: string, containerFormat: string): boolean {
        return LOSSLESS_CODECS.has(codec) || (containerFormat === 'wav' && codec.startsWith('pcm'));
    }

    /** Converts FFprobe string or numeric values into a finite number. */
    private parseNumber(value: string | number | undefined): number {
        const parsed = Number(value ?? 0);

        return Number.isFinite(parsed) ? parsed : 0;
    }

    /** Limits the number of FFprobe processes used by one batch. */
    private getWorkerCount(concurrency: number, fileCount: number): number {
        if (!Number.isInteger(concurrency) || concurrency < 1) {
            throw new RangeError('FFprobe concurrency must be a positive integer.');
        }

        return Math.min(concurrency, MAX_CONCURRENCY, fileCount);
    }

    /** Adds FFprobe stderr to errors when available. */
    private createProbeError(filePath: string, error: unknown): Error {
        const probeError = error as ProbeError;
        const details = probeError.stderr?.trim() ?? this.getErrorMessage(error);

        return new Error(`FFprobe failed for "${path.basename(filePath)}": ${details}`, { cause: error });
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }

    /** Checks whether FFprobe is available and operational. */
    public async ping(): Promise<boolean> {
        try {
            const { stdout } = await execFileAsync(this.binaryPath, ['-version'], {
                timeout: 5000,
                windowsHide: true,
            });
            return stdout.includes('ffprobe');
        } catch {
            return false;
        }
    }
}

/** Creates an FFprobe client with the supplied configuration. */
export function createAudioProber(options?: AudioProberOptions): AudioProber {
    return new AudioProber(options);
}
