import type { NextResponse } from 'next/server';

import fs from 'node:fs/promises';
import { constants } from 'node:fs';

import { serverEnv } from '@/config/env.server';
import { apiSuccess, handleRouteError } from '@/server/api';
import type { ApiResponse } from '@/types/api';
import type { ReadinessHealthData } from '@/types/health';

/**
 * GET /api/health/ready
 * Core readiness probe. Verifies server configuration and media storage accessibility asynchronously.
 */
export async function GET(): Promise<NextResponse<ApiResponse<ReadinessHealthData>>> {
    try {
        const roots = serverEnv.ALLOWED_MEDIA_ROOTS;

        const rootChecks = await Promise.all(
            roots.map(async (root) => {
                try {
                    await fs.access(root, constants.F_OK);
                    return true;
                } catch {
                    return false;
                }
            })
        );

        const storageReady = roots.length > 0 && rootChecks.some(Boolean);
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
