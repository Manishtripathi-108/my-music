import { NextResponse } from 'next/server';

import { type BatchMetadataResponse, type CombinedAudioMetadata, batchMetadataRequestSchema, singleMetadataQuerySchema } from '@/features/media';
import { apiSuccess, handleRouteError } from '@/server/api';
import { getMetadataCoordinator } from '@/server/media';

/* ----------------- Single Audio File Metadata Inspection ------------------ */

/**
 * GET /api/media/metadata?path=/path/to/song.mp3
 * Retrieves unified metadata for a single audio file.
 */
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const { path } = singleMetadataQuerySchema.parse({
            path: searchParams.get('path') ?? undefined,
        });

        const metadata: CombinedAudioMetadata = await getMetadataCoordinator().readMetadata(path);
        return apiSuccess(metadata);
    } catch (error) {
        return handleRouteError(error, 'Failed to inspect audio metadata');
    }
}

/* ------------------ Batch Audio File Metadata Inspection ------------------ */

/**
 * POST /api/media/metadata
 * Body: { paths: string[] }
 * Batch inspects metadata for multiple audio files.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { paths } = batchMetadataRequestSchema.parse(body);

        const metadataMap = await getMetadataCoordinator().readBatch(paths);
        const results: Record<string, CombinedAudioMetadata> = Object.fromEntries(metadataMap);
        const batchResponse: BatchMetadataResponse = {
            total: metadataMap.size,
            results,
        };

        return apiSuccess(batchResponse, {
            message: `Processed metadata inspection for ${batchResponse.total} files`,
        });
    } catch (error) {
        return handleRouteError(error, 'Failed to inspect audio metadata batch');
    }
}
