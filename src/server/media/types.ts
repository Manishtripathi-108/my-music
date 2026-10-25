import 'server-only';

export * from '@/features/media/types';

/**
 * Server-only in-memory picture buffer representation.
 */
export interface RawPictureData {
    data: Buffer;
    mimeType: string;
    description?: string;
}
