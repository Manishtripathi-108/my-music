import { NextResponse } from 'next/server';

import { type TechnicalAudioInfo, technicalQuerySchema } from '@/features/media';
import { apiSuccess, handleRouteError } from '@/server/api';
import { createAudioProber } from '@/server/media';

/* ----------------- Single Audio File Technical Inspection ----------------- */

/**
 * GET /api/media/technical?path=/path/to/song.flac
 * Inspects technical audio stream properties via FFprobe.
 */
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const { path } = technicalQuerySchema.parse({
            path: searchParams.get('path') ?? undefined,
        });

        const prober = createAudioProber();
        const technical: TechnicalAudioInfo = await prober.inspect(path);
        return apiSuccess(technical);
    } catch (error) {
        return handleRouteError(error, 'Failed to inspect technical audio properties');
    }
}
