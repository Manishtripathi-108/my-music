export interface ExifClientOptions {
    /** Path to the ExifTool executable. Uses the server environment path, then `exiftool`. */
    binaryPath?: string;

    /** Maximum execution time for an active ExifTool command. Defaults to 25 seconds. */
    timeoutMs?: number;

    /** Maximum number of requests waiting in the queue. Defaults to 500. */
    maxQueueSize?: number;

    /** Maximum stdout size accepted for one command. Defaults to 10 MiB. */
    maxOutputBytes?: number;

    /** Enables diagnostic logging. Defaults to false. */
    debug?: boolean;
}

export type ExifRawRecord = Record<string, unknown>;

export interface ExifCommandRequest {
    args: string[];
    resolve: (output: string) => void;
    reject: (error: Error) => void;
    timeoutId?: NodeJS.Timeout;
    id: number;
}

/**
 * Result of extracting artwork binary directly to an output file.
 */
export interface ArtworkExtractionResult {
    /** Absolute filesystem path to the extracted file. */
    outputPath: string;

    /** File size of the extracted image in bytes. */
    sizeBytes: number;
}

