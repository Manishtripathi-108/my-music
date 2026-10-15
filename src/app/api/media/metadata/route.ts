import { NextResponse } from 'next/server';

import { type CombinedAudioMetadata, singleMetadataQuerySchema } from '@/features/media';
import { metadataCoordinator } from '@/features/media/server';
import { apiSuccess, handleRouteError } from '@/server/api';

/* ----------------- Single Audio File Metadata Inspection ------------------ */

/**
 * GET /api/media/metadata?path=/path/to/song.mp3
 * Retrieves unified metadata for a single audio file.
 */
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const query = singleMetadataQuerySchema.parse({
            path: searchParams.get('path') ?? undefined,
            includeQC: searchParams.get('includeQC') ?? undefined,
            raw: searchParams.get('raw') ?? undefined,
        });

        const metadata: CombinedAudioMetadata = await metadataCoordinator.read(query.path, {
            includeQC: query.includeQC,
            includeRawPayload: query.raw,
        });

        return apiSuccess(metadata);
    } catch (error) {
        return handleRouteError(error, 'Failed to inspect audio metadata');
    }
}
