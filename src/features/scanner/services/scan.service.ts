import 'server-only';

import type { ScanRequest } from '../schemas/scan-request.schema';
import type { ScanResponseData } from '../types';

/**
 * Initiates a background scan session for the specified audio library directory.
 */
export function initiateLibraryScan(input: ScanRequest): ScanResponseData {
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return {
        scanId,
        directory: input.directory,
        scanMode: input.scanMode,
        recursive: input.recursive,
        timestamp: new Date().toISOString(),
    };
}
