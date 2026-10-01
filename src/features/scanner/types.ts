import type { ApiResponse } from '@/types/api';

import type { ScanMode } from './schemas/scan-request.schema';

export type ScanResponseData = {
    scanId: string;
    directory: string;
    scanMode: ScanMode;
    recursive: boolean;
    timestamp: string;
};

export type ScanResponse = ApiResponse<ScanResponseData>;
