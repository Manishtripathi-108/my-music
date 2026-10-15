import { NextResponse } from 'next/server';

import { type BatchTagWriteResult, batchWriteTagsRequestSchema } from '@/features/media';
import { metadataCoordinator } from '@/features/media/server';
import { apiSuccess, handleRouteError } from '@/server/api';

/* --------------------- Batch File Tag Updating (PATCH) -------------------- */

/**
 * PATCH /api/media/tags/batch
 * Body: { targets: Array<{ path: string, tags: WriteAudioTags }>, preserveOriginal?: boolean }
 * Updates metadata tags across multiple audio files in a single batch using TagLib.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const input = batchWriteTagsRequestSchema.parse(body);

        const targets = input.targets.map((target) => ({
            path: target.path,
            tags: target.tags,
        }));

        const result: BatchTagWriteResult = await metadataCoordinator.writeTagsBatch(targets, {
            preserveOriginal: input.preserveOriginal,
        });

        return apiSuccess(result, {
            message: `Batch tag update complete: ${result.succeeded.length} succeeded, ${result.failed.length} failed`,
        });
    } catch (error) {
        return handleRouteError(error, 'Failed to perform batch tag update');
    }
}
