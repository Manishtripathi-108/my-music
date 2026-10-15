import { z } from 'zod';

/**
 * Application Policy: Audio extensions supported for scanning and tag editing.
 * Derived from the verified intersection of TagLib 2.x and FFprobe demuxing capabilities.
 */
export const SCAN_AUDIO_EXTENSIONS = [
    'mp3',
    'flac',
    'm4a',
    'mp4',
    'ogg',
    'opus',
    'wav',
    'aiff',
    'aif',
    'ape',
    'wv',
    'mpc',
    'wma',
    'dsf',
    'dff',
] as const;

export type ScanAudioExtension = (typeof SCAN_AUDIO_EXTENSIONS)[number];
export const scanAudioExtensionSchema = z.enum(SCAN_AUDIO_EXTENSIONS);

/**
 * Application Policy: Target audio formats supported for conversion and encoding.
 * Derived from the verified encoder suite of standard FFmpeg LGPL builds:
 * - Lossless: flac, alac, wav, aiff, wv
 * - Lossy: mp3, opus, aac, ogg
 */
export const CONVERSION_TARGET_FORMATS = [
    'mp3',
    'flac',
    'opus',
    'aac',
    'alac',
    'wav',
    'aiff',
    'ogg',
    'wv',
] as const;

export type ConversionTargetFormat = (typeof CONVERSION_TARGET_FORMATS)[number];
export const conversionTargetFormatSchema = z.enum(CONVERSION_TARGET_FORMATS);

/**
 * Standard Lossless Codecs recognized across FFprobe and media decoders.
 */
export const LOSSLESS_CODECS = new Set([
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
    'ape',
    'wavpack',
    'truehd',
    'mlp',
    'tak',
    'shorten',
]);

/**
 * Evaluates whether an audio track or stream is uncompressed/lossless based on codec and container.
 *
 * @param codec - Codec identifier (e.g. 'flac', 'pcm_s16le', 'mp3').
 * @param containerFormat - Container format (e.g. 'wav', 'mp4', 'flac').
 */
export function isLosslessAudio(codec: string, containerFormat?: string): boolean {
    const normalized = codec.toLowerCase();
    if (LOSSLESS_CODECS.has(normalized)) return true;
    if (containerFormat?.toLowerCase() === 'wav' && normalized.startsWith('pcm')) return true;
    return false;
}

/**
 * Audio Bitrate Modes (Constant, Variable, Average Bitrate).
 */
export const BITRATE_MODES = ['CBR', 'VBR', 'ABR'] as const;
export type BitrateMode = (typeof BITRATE_MODES)[number];
export const bitrateModeSchema = z.enum(BITRATE_MODES);

/**
 * Parses raw bitrate mode strings (from MediaInfo or file headers) into typed BitrateMode.
 */
export function parseBitrateMode(val: unknown): BitrateMode | undefined {
    const raw = String(val ?? '').toUpperCase();
    if (raw.includes('ABR')) return 'ABR';
    if (raw.includes('VBR') || raw.includes('VARIABLE')) return 'VBR';
    if (raw.includes('CBR') || raw.includes('CONSTANT')) return 'CBR';
    return undefined;
}

