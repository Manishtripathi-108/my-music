import { NextResponse } from 'next/server';

import { convertMediaRequestSchema } from '@/features/media';
import { mediaConverter } from '@/features/media/server';
import { apiCreated, handleRouteError } from '@/server/api';

/* ---------------------- Audio Conversion Endpoint (POST) ------------------ */

/**
 * POST /api/media/convert
 * Body: ConvertMediaRequest
 *
 * Converts and transcodes audio to target codec/container with high-precision DSP filters.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const payload = convertMediaRequestSchema.parse(body);

        const result = await mediaConverter.convert(payload.inputPath, payload);

        return apiCreated(result, {
            message: `Successfully converted "${payload.inputPath}" to ${payload.targetFormat.toUpperCase()}`,
        });
    } catch (error) {
        return handleRouteError(error, 'Failed to convert audio file');
    }
}
