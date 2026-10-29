import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import 'server-only';
import { applyCoverArt, applyTags, clearPictures, readMetadata, readPictures } from 'taglib-wasm/simple';

import { serverEnv } from '@/config/env.server';
import type { AudioTags, WriteAudioTags } from '@/lib/media';

import { type ToolHealth } from '../tool-inspector';
import type { RawPictureData, TagWriteOptions, TagWriteResult } from '../types';
import { TagMapper } from './tag-mapper';

/**
 * Audio Metadata Adapter powered by TagLib 2.x (taglib-wasm).
 * Preserves audio bitstreams bit-for-bit with atomic crash-safe writes.
 */
export class TagLibAdapter {
    /**
     * Returns health diagnostics for this adapter.
     */
    public static async getToolHealth(): Promise<ToolHealth> {
        return {
            configured: serverEnv.METADATA_ENGINE,
            active: 'wasm',
            implementations: {
                native: { available: false, version: null, path: null },
                wasm: { available: true },
            },
            status: 'healthy',
        };
    }

    /**
     * Reads all normalized tags and embedded cover art from an audio file.
     */
    public async readTags(canonicalPath: string): Promise<{
        tags: AudioTags;
        raw: Record<string, unknown>;
        artwork: RawPictureData | null;
    }> {
        const fileBuffer = await fs.promises.readFile(canonicalPath);

        const [metadata, pictures] = await Promise.all([readMetadata(fileBuffer).catch(() => null), readPictures(fileBuffer).catch(() => [])]);

        const raw = {
            ...((metadata?.properties as unknown as Record<string, unknown>) ?? {}),
            ...((metadata?.tags as unknown as Record<string, unknown>) ?? {}),
        };
        const tags = TagMapper.fromTagLibProperties(raw);

        const primaryPicture = pictures && pictures.length > 0 ? (pictures.find((p) => p.type === 'FrontCover') ?? pictures[0]) : null;

        const artwork: RawPictureData | null = primaryPicture
            ? {
                  data: Buffer.from(primaryPicture.data),
                  mimeType: primaryPicture.mimeType || 'image/jpeg',
                  description: primaryPicture.description,
              }
            : null;

        return { tags, raw, artwork };
    }

    /**
     * Updates metadata tags on an audio file without re-encoding audio bitstreams.
     */
    public async writeTags(canonicalPath: string, tags: WriteAudioTags, options: TagWriteOptions = {}): Promise<TagWriteResult> {
        const backupPath = await this.createBackupIfNeeded(canonicalPath, options.preserveOriginal);
        const fileBuffer = await fs.promises.readFile(canonicalPath);
        const plan = TagMapper.toTagLibProperties(tags);

        const updatedBuffer = await applyTags(fileBuffer, plan);
        await this.atomicWriteFile(canonicalPath, Buffer.from(updatedBuffer));

        const { tags: updatedTags } = await this.readTags(canonicalPath);
        return { filePath: canonicalPath, backupPath, tags: updatedTags };
    }

    /**
     * Embeds an image buffer as primary FrontCover artwork into an audio file.
     */
    public async embedArtwork(
        canonicalPath: string,
        imageBuffer: Buffer,
        mimeType = 'image/jpeg',
        options: TagWriteOptions = {}
    ): Promise<TagWriteResult> {
        const backupPath = await this.createBackupIfNeeded(canonicalPath, options.preserveOriginal);
        const fileBuffer = await fs.promises.readFile(canonicalPath);

        const updatedBuffer = await applyCoverArt(fileBuffer, imageBuffer, mimeType);
        await this.atomicWriteFile(canonicalPath, Buffer.from(updatedBuffer));

        const { tags: updatedTags } = await this.readTags(canonicalPath);
        return { filePath: canonicalPath, backupPath, tags: updatedTags };
    }

    /**
     * Clears all embedded cover art from an audio file.
     */
    public async removeArtwork(canonicalPath: string, options: TagWriteOptions = {}): Promise<TagWriteResult> {
        const backupPath = await this.createBackupIfNeeded(canonicalPath, options.preserveOriginal);
        const fileBuffer = await fs.promises.readFile(canonicalPath);

        const updatedBuffer = await clearPictures(fileBuffer);
        await this.atomicWriteFile(canonicalPath, Buffer.from(updatedBuffer));

        const { tags: updatedTags } = await this.readTags(canonicalPath);
        return { filePath: canonicalPath, backupPath, tags: updatedTags };
    }

    private async createBackupIfNeeded(canonicalPath: string, preserveOriginal?: boolean): Promise<string | undefined> {
        if (!preserveOriginal) return undefined;

        const backupPath = `${canonicalPath}_original`;
        try {
            await fs.promises.link(canonicalPath, backupPath);
        } catch {
            await fs.promises.copyFile(canonicalPath, backupPath);
        }
        return backupPath;
    }

    private async atomicWriteFile(targetPath: string, buffer: Buffer): Promise<void> {
        const dir = path.dirname(targetPath);
        const base = path.basename(targetPath);
        const tempPath = path.join(dir, `.${base}.tmp_${crypto.randomUUID().slice(0, 8)}`);

        const handle = await fs.promises.open(tempPath, 'w');
        try {
            await handle.write(buffer);
            await handle.sync();
        } finally {
            await handle.close();
        }

        const stats = await fs.promises.stat(targetPath).catch(() => null);
        if (stats) {
            await fs.promises.utimes(tempPath, stats.atime, stats.mtime).catch(() => {});
        }

        await fs.promises.rename(tempPath, targetPath);
        if (stats) {
            await fs.promises.utimes(targetPath, stats.atime, stats.mtime).catch(() => {});
        }
    }
}
