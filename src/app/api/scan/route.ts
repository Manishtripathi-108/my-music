import { NextResponse } from 'next/server';

import { apiAccepted, apiInternalError, apiValidationError } from '@/server/api';
import { scanRequestSchema, type ScanResponse } from '@/features/scanner';

export async function POST(request: Request): Promise<NextResponse<ScanResponse>> {
    const body = await request.json();

    const parseResult = scanRequestSchema.safeParse(body);

    if (!parseResult.success) {
        return apiValidationError(parseResult.error.issues, 'Invalid scan request parameters');
    }

    try {
        const validData = parseResult.data;
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
        return apiInternalError(error, 'Failed to initiate library scan');
    }
}
