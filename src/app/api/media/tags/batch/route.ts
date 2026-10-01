import { NextResponse } from 'next/server';

import { type BatchTagWriteResult, batchWriteTagsRequestSchema } from '@/features/media';
import { apiSuccess, handleRouteError } from '@/server/api';
import { getExifClient } from '@/server/media';

/* --------------------- Batch File Tag Updating (PATCH) -------------------- */

/**
 * PATCH /api/media/tags/batch
 * Body: { targets: Array<{ path: string, tags: Record<string, unknown> }>, preserveOriginal?: boolean }
 * Partially updates metadata tags across multiple audio files in a single batch.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const input = batchWriteTagsRequestSchema.parse(body);

        const targets = input.targets.map((target) => ({
            path: target.path,
            tags: target.tags,
        }));

        const result: BatchTagWriteResult = await getExifClient().writeTagsBatch(targets, {
            preserveOriginal: input.preserveOriginal,
        });

        return apiSuccess(result, {
            message: `Batch tag update complete: ${result.succeeded.length} succeeded, ${result.failed.length} failed`,
        });
    } catch (error) {
        return handleRouteError(error, 'Failed to perform batch tag update');
    }
}
