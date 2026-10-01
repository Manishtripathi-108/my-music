import { NextResponse } from 'next/server';

import { type BatchMetadataResponse, type CombinedAudioMetadata, batchMetadataRequestSchema } from '@/features/media';
import { apiSuccess, handleRouteError } from '@/server/api';
import { getMetadataCoordinator } from '@/server/media';

/* ------------------ Batch Audio File Metadata Inspection ------------------ */

/**
 * POST /api/media/metadata/batch
 * Body: { paths: string[] }
 * Dedicated batch audio metadata inspection endpoint.
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
