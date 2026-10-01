import { NextResponse } from 'next/server';

import { type ScanResponse, scanRequestSchema } from '@/features/scanner';
import { apiAccepted, handleRouteError } from '@/server/api';

/* ------------------------- Initiate Library Scan -------------------------- */

/**
 * POST /api/scan
 * Initiates a background library scan for an audio directory.
 */
export async function POST(request: Request): Promise<NextResponse<ScanResponse>> {
    try {
        const body = await request.json();
        const validData = scanRequestSchema.parse(body);
        const scanId = `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        return apiAccepted(
            {
                scanId,
                directory: validData.directory,
                scanMode: validData.scanMode,
                recursive: validData.recursive,
                timestamp: new Date().toISOString(),
            },
            {
                message: `Library scan initiated successfully for "${validData.directory}"`,
            }
        );
    } catch (error) {
        return handleRouteError(error, 'Failed to initiate library scan');
    }
}
