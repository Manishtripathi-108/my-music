import { NextResponse } from 'next/server';

import { technicalQuerySchema } from '@/features/media';
import { metadataCoordinator } from '@/features/media/server';
import { apiSuccess, handleRouteError } from '@/server/api';

/* ----------------- Single Audio File Technical Inspection ----------------- */

/**
 * GET /api/media/technical?path=/path/to/song.flac&includeQC=true
 * Inspects technical audio stream properties via FFprobe and optional MediaInfo QC.
 */
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const query = technicalQuerySchema.parse({
            path: searchParams.get('path') ?? undefined,
            includeQC: searchParams.get('includeQC') ?? undefined,
        });

        const metadata = await metadataCoordinator.read(query.path, {
            extractArtwork: false,
            includeQC: query.includeQC,
            includeRawPayload: false,
        });

        return apiSuccess({
            technical: metadata.technical,
            qc: metadata.qc,
        });
    } catch (error) {
        return handleRouteError(error, 'Failed to inspect technical audio properties');
    }
}
