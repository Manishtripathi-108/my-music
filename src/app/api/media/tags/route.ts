import { NextResponse } from 'next/server';

import { type AudioTags, type TagWriteResult, tagsQuerySchema, writeTagsRequestSchema } from '@/features/media';
import { apiSuccess, handleRouteError } from '@/server/api';
import { getExifClient, getMetadataCoordinator } from '@/server/media';

/* ----------------------- Read Audio File Tags (GET) ----------------------- */

/**
 * GET /api/media/tags?path=/path/to/song.mp3
 * Retrieves normalized audio tags for a single audio file.
 */
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const { path } = tagsQuerySchema.parse({
            path: searchParams.get('path') ?? undefined,
        });

        const metadata = await getMetadataCoordinator().readMetadata(path, {
            extractArtwork: false,
            includeRawPayload: false,
        });

        const tags: AudioTags = metadata.tags;
        return apiSuccess(tags);
    } catch (error) {
        return handleRouteError(error, 'Failed to read metadata tags');
    }
}

/* --------------------- Update Audio File Tags (PATCH) --------------------- */

/**
 * PATCH /api/media/tags
 * Body: { path: string, tags: Record<string, string | number | string[] | null>, preserveOriginal?: boolean }
 * Partially updates metadata tags on a single audio file.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const input = writeTagsRequestSchema.parse(body);

        const result: TagWriteResult = await getExifClient().writeTags(input.path, input.tags, {
            preserveOriginal: input.preserveOriginal,
        });

        return apiSuccess(result, {
            message: `Tags updated successfully for "${input.path}"`,
        });
    } catch (error) {
        return handleRouteError(error, 'Failed to update metadata tags');
    }
}

/* --------------- Update Audio File Tags (POST Compatibility) -------------- */

/**
 * POST /api/media/tags
 * Backward-compatible endpoint delegating to PATCH semantics.
 */
export async function POST(request: Request): Promise<NextResponse> {
    return PATCH(request);
}
