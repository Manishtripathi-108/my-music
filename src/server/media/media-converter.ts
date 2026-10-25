import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import 'server-only';

import { serverEnv } from '@/config/env.server';
import { clamp, parseFloatNumber, parseOptionalNumber } from '@/lib/number';

import { FFprobeAdapter } from './adapters/ffprobe.adapter';
import { authorizeInputPath, authorizeOutputPath } from './path-security';
import { type ToolHealth, inspectNativeTool, resolveActiveEngine, toolHealthStatus } from './tool-inspector';
import type { ConversionOptions, ConversionProgress, ConversionProgressCallback, ConversionResult } from './types';

/**
 * Audio Conversion and Digital Signal Processing (DSP) Engine.
 * Wraps native FFmpeg with libsoxr resampling, triangular dithering,
 * real-time progress parsing, and atomic sibling temp delivery.
 */
export class MediaConverter {
    private readonly ffmpegPath: string;
    private readonly prober: FFprobeAdapter;

    constructor(ffmpegPath = serverEnv.FFMPEG_PATH, prober = new FFprobeAdapter()) {
        this.ffmpegPath = ffmpegPath;
        this.prober = prober;
    }

    /**
     * Returns health diagnostics for this adapter.
     */
    public static async getToolHealth(): Promise<ToolHealth> {
        const native = await inspectNativeTool(
            'ffmpeg',
            serverEnv.FFMPEG_PATH,
            ['-version'],
            (output) => output.match(/ffmpeg version\s+([^\s,]+)/i)?.[1] ?? null
        );

        const configured = serverEnv.CONVERSION_ENGINE;
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
     * Converts an audio file according to the target specifications.
     *
     * @param inputPath - Raw or canonical input audio path.
     * @param options - Conversion and DSP target options.
     * @param onProgress - Optional callback for real-time progress reporting.
     * @param signal - Optional AbortSignal for graceful cancellation.
     */
    public async convert(
        inputPath: string,
        options: ConversionOptions,
        onProgress?: ConversionProgressCallback,
        signal?: AbortSignal
    ): Promise<ConversionResult> {
        const canonicalInput = await authorizeInputPath(inputPath);

        const defaultOutput = options.outputPath
            ? options.outputPath
            : path.join(path.dirname(canonicalInput), `${path.parse(canonicalInput).name}_converted.${options.targetFormat}`);

        const canonicalOutput = await authorizeOutputPath(defaultOutput);
        const probeInfo = await this.prober.inspect(canonicalInput);
        const totalDuration = probeInfo.duration || 1;

        const targetDir = path.dirname(canonicalOutput);
        const baseName = path.basename(canonicalOutput);
        const ext = path.extname(baseName) || `.${options.targetFormat}`;
        const nameWithoutExt = path.parse(baseName).name;
        const tempPath = path.join(targetDir, `.${nameWithoutExt}.tmp_${crypto.randomUUID().slice(0, 8)}${ext}`);

        const cleanupTemp = async () => {
            await fs.promises.unlink(tempPath).catch(() => {});
        };

        const args = this.buildArgs(canonicalInput, tempPath, options);

        return new Promise((resolve, reject) => {
            const child = spawn(this.ffmpegPath, args, {
                windowsHide: true,
                stdio: ['pipe', 'pipe', 'pipe'],
            });

            let progressBuffer = '';
            let stderrData = '';

            if (signal) {
                signal.addEventListener('abort', () => {
                    try {
                        child.stdin?.write('q');
                    } catch {
                        // Stdin might already be closed
                    }
                    setTimeout(() => {
                        try {
                            child.kill('SIGKILL');
                        } catch {
                            // Already terminated
                        }
                    }, 2000);
                });
            }

            child.stdout?.on('data', (chunk: Buffer) => {
                progressBuffer += chunk.toString('utf8');
                const lines = progressBuffer.split('\n');
                progressBuffer = lines.pop() || '';

                const progress = this.parseProgress(lines, totalDuration);
                if (progress && onProgress) {
                    onProgress(progress);
                }
            });

            child.stderr?.on('data', (chunk: Buffer) => {
                stderrData += chunk.toString('utf8');
                if (stderrData.length > 50000) {
                    stderrData = stderrData.slice(-50000);
                }
            });

            child.on('error', async (err) => {
                await cleanupTemp();
                reject(new Error(`Failed to launch FFmpeg process: ${err.message}`));
            });

            child.on('close', async (code) => {
                if (signal?.aborted) {
                    await cleanupTemp();
                    return reject(new Error('Audio conversion was cancelled by user'));
                }

                if (code !== 0) {
                    await cleanupTemp();
                    return reject(new Error(`FFmpeg conversion failed (code ${code}): ${stderrData}`));
                }

                try {
                    await fs.promises.rename(tempPath, canonicalOutput);
                    const stats = await fs.promises.stat(canonicalOutput);

                    resolve({
                        inputPath: canonicalInput,
                        outputPath: canonicalOutput,
                        targetFormat: options.targetFormat,
                        duration: totalDuration,
                        sizeBytes: stats.size,
                    });
                } catch (err) {
                    await cleanupTemp();
                    reject(new Error(`Failed to finalize converted audio file: ${(err as Error).message}`));
                }
            });
        });
    }

    private buildArgs(inputPath: string, outputPath: string, options: ConversionOptions): string[] {
        const args: string[] = ['-y', '-v', 'error', '-i', inputPath, '-progress', 'pipe:1', '-nostats'];

        const audioFilters: string[] = [];

        if (options.downmixStereo) {
            args.push('-ac', '2');
        } else if (options.channels) {
            args.push('-ac', String(options.channels));
        }

        const resampler = options.resampler || 'soxr';
        const dither = options.ditherMethod || 'triangular';

        let resampleFilter = `aresample=resampler=${resampler}:precision=28:cutoff=0.99`;
        if (dither) {
            resampleFilter += `:dither_method=${dither}`;
        }
        audioFilters.push(resampleFilter);

        if (audioFilters.length > 0) {
            args.push('-af', audioFilters.join(','));
        }

        if (options.sampleRate) {
            args.push('-ar', String(options.sampleRate));
        }

        this.applyCodecSettings(args, options);

        args.push(outputPath);
        return args;
    }

    private applyCodecSettings(args: string[], options: ConversionOptions): void {
        switch (options.targetFormat) {
            case 'mp3':
                args.push('-c:a', 'libmp3lame');
                if (options.bitrate) {
                    args.push('-b:a', options.bitrate);
                } else {
                    args.push('-qscale:a', '0');
                }
                break;

            case 'aac':
                args.push('-c:a', 'aac');
                if (options.bitrate) {
                    args.push('-b:a', options.bitrate);
                } else {
                    args.push('-b:a', '256k');
                }
                break;

            case 'opus':
                args.push('-c:a', 'libopus');
                if (options.bitrate) {
                    args.push('-b:a', options.bitrate);
                } else {
                    args.push('-b:a', '160k');
                }
                break;

            case 'flac':
                args.push('-c:a', 'flac');
                if (options.bitDepth === 24) {
                    args.push('-sample_fmt', 's32');
                } else {
                    args.push('-sample_fmt', 's16');
                }
                break;

            case 'alac':
                args.push('-c:a', 'alac');
                break;

            case 'wav':
                if (options.bitDepth === 24) {
                    args.push('-c:a', 'pcm_s24le');
                } else if (options.bitDepth === 32) {
                    args.push('-c:a', 'pcm_s32le');
                } else {
                    args.push('-c:a', 'pcm_s16le');
                }
                break;

            case 'aiff':
                if (options.bitDepth === 24) {
                    args.push('-c:a', 'pcm_s24be');
                } else if (options.bitDepth === 32) {
                    args.push('-c:a', 'pcm_s32be');
                } else {
                    args.push('-c:a', 'pcm_s16be');
                }
                break;

            case 'ogg':
                args.push('-c:a', 'libvorbis');
                if (options.bitrate) {
                    args.push('-b:a', options.bitrate);
                } else {
                    args.push('-qscale:a', '6');
                }
                break;

            case 'wv':
                args.push('-c:a', 'wavpack');
                break;
        }
    }

    private parseProgress(lines: string[], totalDuration: number): ConversionProgress | null {
        let currentTimeMicros: number | null = null;
        let speed = '1x';
        let fps = 0;
        let bitRateKbps = 0;

        for (const line of lines) {
            const [key, value] = line.trim().split('=');
            if (!key || !value) continue;

            if (key === 'out_time_us') {
                const micros = parseOptionalNumber(value);
                if (micros !== undefined) {
                    currentTimeMicros = micros;
                }
            } else if (key === 'speed') {
                speed = value;
            } else if (key === 'fps') {
                const parsedFps = parseOptionalNumber(value);
                if (parsedFps !== undefined) fps = parsedFps;
            } else if (key === 'bitrate') {
                const parsedKbps = parseFloatNumber(value.replace(/kbits\/s/i, '').trim());
                if (parsedKbps !== undefined) bitRateKbps = parsedKbps;
            }
        }

        if (currentTimeMicros === null) {
            return null;
        }

        const currentTimeSeconds = currentTimeMicros / 1000000;
        const percent = clamp((currentTimeSeconds / totalDuration) * 100, 0, 100);

        return {
            percent: Math.round(percent * 10) / 10,
            currentTimeSeconds: Math.round(currentTimeSeconds * 100) / 100,
            speed,
            fps,
            bitRateKbps,
        };
    }
}

export const mediaConverter = new MediaConverter();
