import type { NextResponse } from 'next/server';

import { getMediaDiagnostics, type MediaDiagnosticsReport } from '@/server/media/media-diagnostics';
import { apiSuccess, handleRouteError } from '@/server/api';
import type { ApiResponse } from '@/types/api';

/**
 * GET /api/health/media
 * Detailed media engine diagnostics.
 * Inspects TagLib native worker sidecar, FFprobe prober, MediaInfo QC inspector,
 * and FFmpeg converter availability, paths, versions, and active runtime modes.
 */
export async function GET(): Promise<NextResponse<ApiResponse<MediaDiagnosticsReport>>> {
    try {
        const diagnostics = await getMediaDiagnostics();
        return apiSuccess(diagnostics);
    } catch (error) {
        return handleRouteError(error, 'Failed to perform media diagnostics check');
    }
}
