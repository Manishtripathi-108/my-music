import { NextResponse } from 'next/server';

import { type CombinedAudioMetadata, singleMetadataQuerySchema } from '@/features/media';
import { apiSuccess, handleRouteError } from '@/server/api';
import { getMetaReader } from '@/server/media';

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

        const metadata: CombinedAudioMetadata = await getMetaReader().read(path);
        return apiSuccess(metadata);
    } catch (error) {
        return handleRouteError(error, 'Failed to inspect audio metadata');
    }
}
