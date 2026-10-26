import { execFile } from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';
import 'server-only';

import { serverEnv } from '@/config/env.server';
import { parseBitrateMode } from '@/lib/media';
import { parseOptionalNumber } from '@/lib/number';

import { type ToolHealth, evaluateToolHealth } from '../tool-inspector';
import type { MediaInfoQC } from '../types';

const execFileAsync = promisify(execFile);

function parseMediaInfoVersion(output: string): string | null {
    return output.match(/MediaInfoLib\s*-\s*v?([^\s\r\n]+)/i)?.[1] ?? output.match(/\bv?(\d+\.\d+(?:\.\d+)?)\b/)?.[1] ?? null;
}

/**
 * MediaInfo Forensic Quality-Control Adapter.
 * Runs native MediaInfo CLI as primary engine, falling back to mediainfo.js (WASM).
 * Extracts deep forensics (true bit depth, CBR vs VBR, encoder library, gapless delay/padding).
 */
export class MediaInfoAdapter {
    private readonly binaryPath: string;

    constructor(binaryPath = serverEnv.MEDIAINFO_PATH) {
        this.binaryPath = binaryPath;
    }

    /**
     * Returns health diagnostics for this adapter.
     */
    public static async getToolHealth(): Promise<ToolHealth> {
        return evaluateToolHealth('mediaInfo', serverEnv.MEDIAINFO_PATH, ['--version'], parseMediaInfoVersion, serverEnv.PROBING_ENGINE);
    }

    /**
     * Inspects an audio file and returns forensic quality-control metrics.
     *
     * @param canonicalPath - Pre-authorized canonical absolute file path.
     */
    public async inspect(canonicalPath: string): Promise<MediaInfoQC> {
        const configured = serverEnv.PROBING_ENGINE;

        if (configured === 'wasm') {
            try {
                return await this.inspectWasm(canonicalPath);
            } catch {
                return await this.inspectNative(canonicalPath);
            }
        }

        try {
            return await this.inspectNative(canonicalPath);
        } catch {
            return await this.inspectWasm(canonicalPath);
        }
    }

    private async inspectNative(canonicalPath: string): Promise<MediaInfoQC> {
        const { stdout } = await execFileAsync(this.binaryPath, ['--Output=JSON', '--Full', canonicalPath], {
            maxBuffer: 10 * 1024 * 1024,
            windowsHide: true,
        });

        const parsed = JSON.parse(stdout);
        return this.normalizeResult(parsed);
    }

    private async inspectWasm(canonicalPath: string): Promise<MediaInfoQC> {
        const { default: mediaInfoFactory } = await import('mediainfo.js');
        const mediaInfo = await mediaInfoFactory({ format: 'object' });

        const fileHandle = await fs.promises.open(canonicalPath, 'r');
        const fileStats = await fileHandle.stat();

        try {
            const readChunk = async (size: number, offset: number): Promise<Uint8Array> => {
                const buffer = Buffer.alloc(size);
                const { bytesRead } = await fileHandle.read(buffer, 0, size, offset);
                return buffer.subarray(0, bytesRead);
            };

            const result = await mediaInfo.analyzeData(fileStats.size, readChunk);
            return this.normalizeResult(result);
        } finally {
            await fileHandle.close();
            mediaInfo.close();
        }
    }

    private normalizeResult(raw: unknown): MediaInfoQC {
        const payload = raw as {
            media?: {
                track?: Array<Record<string, unknown>>;
            };
        };

        const tracks = payload?.media?.track ?? [];
        const audioTrack = tracks.find((track) => track['@type'] === 'Audio') ?? {};
        const generalTrack = tracks.find((track) => track['@type'] === 'General') ?? {};

        const bitrateMode = parseBitrateMode(audioTrack.BitRate_Mode || generalTrack.BitRate_Mode);
        const format = String(audioTrack.Format || generalTrack.Format || 'unknown');
        const overallBitrate = parseOptionalNumber(generalTrack.OverallBitRate || audioTrack.BitRate);
        const maximumBitrate = parseOptionalNumber(audioTrack.BitRate_Maximum);
        const bitDepth = parseOptionalNumber(audioTrack.BitDepth);
        const compressionMode = typeof audioTrack.Compression_Mode === 'string' ? audioTrack.Compression_Mode : undefined;
        const encodedLibrary = typeof audioTrack.Encoded_Library === 'string' ? audioTrack.Encoded_Library : undefined;
        const encodedLibrarySettings = typeof audioTrack.Encoded_Library_Settings === 'string' ? audioTrack.Encoded_Library_Settings : undefined;
        const delay = parseOptionalNumber(audioTrack.Delay);
        const padding = parseOptionalNumber(audioTrack.Padding);

        return {
            format,
            bitrateMode,
            overallBitrate,
            maximumBitrate,
            bitDepth,
            compressionMode,
            encodedLibrary,
            encodedLibrarySettings,
            delay,
            padding,
            rawTracks: tracks,
        };
    }
}
