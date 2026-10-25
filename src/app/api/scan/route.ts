import type { NextResponse } from 'next/server';

import { scanRequestSchema, type ScanResponseData } from '@/features/scanner';
import { initiateLibraryScan } from '@/features/scanner/server';
import { apiAccepted, handleRouteError } from '@/server/api';
import type { ApiResponse } from '@/types/api';

/* ------------------------- Initiate Library Scan -------------------------- */

/**
 * POST /api/scan
 * Initiates a background library scan for an audio directory.
 */
export async function POST(request: Request): Promise<NextResponse<ApiResponse<ScanResponseData>>> {
    try {
        const body = await request.json();
        const validData = scanRequestSchema.parse(body);
        const result = initiateLibraryScan(validData);

        return apiAccepted(result, {
            message: `Library scan initiated successfully for "${validData.directory}"`,
        });
    } catch (error) {
        return handleRouteError(error, 'Failed to initiate library scan');
    }
}
