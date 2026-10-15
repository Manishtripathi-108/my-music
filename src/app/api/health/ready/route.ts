import fs from 'node:fs';
import type { NextResponse } from 'next/server';

import { serverEnv } from '@/config/env.server';
import { apiSuccess, handleRouteError } from '@/server/api';
import type { ApiResponse } from '@/types/api';

export interface ReadinessHealthData {
    status: 'ready' | 'unready';
    checks: {
        configuration: 'ready' | 'failed';
        storage: 'ready' | 'failed';
    };
    timestamp: string;
}

/**
 * GET /api/health/ready
 * Core readiness probe. Verifies server configuration and media storage accessibility.
 */
export async function GET(): Promise<NextResponse<ApiResponse<ReadinessHealthData>>> {
    try {
        const roots = serverEnv.ALLOWED_MEDIA_ROOTS;
        const storageReady = roots.length > 0 && roots.some((root) => {
            try {
                return fs.existsSync(root);
            } catch {
                return false;
            }
        });

        const isReady = storageReady;

        return apiSuccess({
            status: isReady ? 'ready' : 'unready',
            checks: {
                configuration: 'ready',
                storage: storageReady ? 'ready' : 'failed',
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return handleRouteError(error, 'Failed to perform readiness check');
    }
}
