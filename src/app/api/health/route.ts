import type { NextResponse } from 'next/server';

import { apiSuccess } from '@/server/api';
import type { ApiResponse } from '@/types/api';

export interface LivenessHealthData {
    status: 'ok';
    uptime: number;
    timestamp: string;
}

/**
 * GET /api/health
 * Basic liveness probe. Fast and non-blocking verification that the process is running.
 */
export async function GET(): Promise<NextResponse<ApiResponse<LivenessHealthData>>> {
    return apiSuccess({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
}
