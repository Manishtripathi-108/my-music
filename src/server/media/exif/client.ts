import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import 'server-only';

import { serverEnv } from '@/config/env.server';

import type { BatchTagWriteResult, BatchTagWriteTarget, ExifTagValue, TagWriteOptions, TagWriteResult } from '../types';
import type { ExifClientOptions, ExifCommandRequest, ExifRawRecord } from './types';

const DEFAULT_TIMEOUT_MS = 25_000;
const DEFAULT_QUEUE_SIZE = 500;
const DEFAULT_OUTPUT_BYTES = 10 * 1024 * 1024;
const SHUTDOWN_TIMEOUT_MS = 2_000;
const MAX_ERROR_BYTES = 64 * 1024;
const isDev = process.env.NODE_ENV === 'development';

/* ----------------------- ExifClient Process Manager ----------------------- */

/**
 * Manages a persistent ExifTool child process via `-stay_open True -@ -`.
 * Eliminates per-command Perl runtime startup overhead (reducing latency
 * from ~250ms to ~15ms).
 *
 * Provides batch processing, tag writing with optional backups, and
 * robust lifecycle recovery.
 */
export class ExifClient {
    private readonly binaryPath: string;
    private readonly timeoutMs: number;
    private readonly maxQueueSize: number;
    private readonly maxOutputBytes: number;
    private readonly debug: boolean;

    private toolProcess: ChildProcessWithoutNullStreams | null = null;
    private queue: ExifCommandRequest[] = [];
    private currentRequest: ExifCommandRequest | null = null;
    private outputBuffer = '';
    private outputBytes = 0;
    private errorBuffer = '';
    private id = 0;
    private closing = false;
    private closePromise: Promise<void> | null = null;
    private exitHandler: (() => void) | null = null;

    constructor(options: ExifClientOptions = {}) {
        const binaryPath = options.binaryPath ?? serverEnv.EXIFTOOL_PATH ?? 'exiftool';
        const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        const maxQueueSize = options.maxQueueSize ?? DEFAULT_QUEUE_SIZE;
        const maxOutputBytes = options.maxOutputBytes ?? DEFAULT_OUTPUT_BYTES;

        if (!binaryPath.trim()) {
            throw new Error('ExifTool binary path cannot be empty.');
        }
        if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
            throw new RangeError('ExifTool timeoutMs must be greater than 0.');
        }
        if (!Number.isInteger(maxQueueSize) || maxQueueSize <= 0) {
            throw new RangeError('ExifTool maxQueueSize must be a positive integer.');
        }
        if (!Number.isInteger(maxOutputBytes) || maxOutputBytes <= 0) {
            throw new RangeError('ExifTool maxOutputBytes must be a positive integer.');
        }

        this.binaryPath = binaryPath;
        this.timeoutMs = timeoutMs;
        this.maxQueueSize = maxQueueSize;
        this.maxOutputBytes = maxOutputBytes;
        this.debug = options.debug ?? isDev;

        this.registerExitHook();
    }

    private ensureProcess(): ChildProcessWithoutNullStreams {
        if (this.toolProcess && !this.toolProcess.killed && this.toolProcess.exitCode === null) {
            return this.toolProcess;
        }

        if (this.toolProcess) {
            this.resetProcess(this.toolProcess);
        }

        if (this.debug) {
            console.debug(`[ExifClient] Starting ${this.binaryPath} in stay-open mode.`);
        }

        const toolProcess = spawn(this.binaryPath, ['-stay_open', 'True', '-@', '-', '-common_args', '-charset', 'filename=utf8'], {
            shell: false,
            windowsHide: true,
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        this.toolProcess = toolProcess;
        toolProcess.stdout.setEncoding('utf8');
        toolProcess.stderr.setEncoding('utf8');

        toolProcess.stdout.on('data', (chunk: string) => {
            if (this.toolProcess === toolProcess) {
                this.handleStdout(chunk);
            }
        });

        toolProcess.stderr.on('data', (chunk: string) => {
            if (this.toolProcess !== toolProcess) {
                return;
            }

            if (this.currentRequest) {
                this.captureStderr(chunk);
            }

            if (this.debug) {
                console.warn('[ExifClient stderr]', chunk.trim());
            }
        });

        toolProcess.once('error', (error: Error) => {
            if (this.toolProcess === toolProcess) {
                this.handleProcessError(toolProcess, error);
            }
        });

        toolProcess.once('exit', (code, signal) => {
            if (this.toolProcess === toolProcess) {
                this.handleProcessExit(toolProcess, code, signal);
            }
        });

        return toolProcess;
    }

    private handleStdout(chunk: string): void {
        if (this.closing || !this.currentRequest) {
            return;
        }

        this.outputBuffer += chunk;
        this.outputBytes += Buffer.byteLength(chunk, 'utf8');

        // If the output exceeds the maximum allowed bytes, reject the current request and reset the process.
        if (this.outputBytes > this.maxOutputBytes) {
            const request = this.currentRequest;
            const error = new Error(`ExifTool output exceeded the ${this.maxOutputBytes}-byte limit (request ${request.id}).`);

            this.resetProcess(this.toolProcess);
            this.rejectCurrent(error);
            this.runNext();
            return;
        }

        // Check for the ready marker indicating the end of the current request's output.
        const request = this.currentRequest;
        const readyMarker = `{ready${request.id}}`;
        const readyIndex = this.outputBuffer.indexOf(readyMarker);

        if (readyIndex === -1) {
            return;
        }

        const rawOutput = this.outputBuffer.slice(0, readyIndex);
        this.outputBuffer = this.outputBuffer.slice(readyIndex + readyMarker.length);

        const result = this.parseOutput(rawOutput, request.id);
        if (!result) {
            const error = new Error(`ExifTool did not return a valid status marker for request ${request.id}.`);

            this.resetProcess(this.toolProcess);
            this.rejectCurrent(error);
            this.runNext();
            return;
        }

        // If the command failed, reject the current request and reset the process.
        if (result.status !== 0) {
            const details = this.errorBuffer.trim();
            const message = `ExifTool command failed with status ${result.status}${details ? `: ${details}` : '.'}`;

            this.rejectCurrent(new Error(message));
            this.runNext();
            return;
        }

        this.resolveCurrent(result.output);
        this.runNext();
    }

    private handleProcessError(toolProcess: ChildProcessWithoutNullStreams, error: Error): void {
        if (this.toolProcess !== toolProcess) {
            return;
        }

        const details = this.errorBuffer.trim();
        const processError = details ? new Error(`${error.message}: ${details}`) : error;

        this.resetProcess(toolProcess);
        this.rejectCurrent(processError);
        this.runNext();
    }

    private handleProcessExit(toolProcess: ChildProcessWithoutNullStreams, code: number | null, signal: NodeJS.Signals | null): void {
        if (this.toolProcess !== toolProcess) {
            return;
        }

        this.toolProcess = null;

        if (this.closing) {
            this.clearBuffers();
            return;
        }

        const details = this.errorBuffer.trim();
        const reason = signal ? `signal ${signal}` : `exit code ${code ?? 'unknown'}`;
        const error = new Error(`ExifTool process exited unexpectedly with ${reason}${details ? `: ${details}` : '.'}`);

        this.clearBuffers();
        this.rejectCurrent(error);
        this.runNext();
    }

    private runNext(): void {
        if (this.closing || this.currentRequest || this.queue.length === 0) {
            return;
        }

        const request = this.queue.shift()!;
        this.currentRequest = request;
        this.clearBuffers();

        try {
            const toolProcess = this.ensureProcess();
            if (!toolProcess.stdin.writable) {
                throw new Error('ExifTool stdin is not writable.');
            }

            // Start the timeout when execution begins, not while the request is queued.
            request.timeoutId = setTimeout(() => this.handleTimeout(request), this.timeoutMs);

            toolProcess.stdin.write(this.buildCommand(request), 'utf8');
        } catch (error) {
            this.resetProcess(this.toolProcess);
            this.rejectCurrent(error instanceof Error ? error : new Error(String(error)));
            this.runNext();
        }
    }

    public execute(args: string[]): Promise<string> {
        if (this.closing) {
            return Promise.reject(new Error('ExifClient is shutting down.'));
        }
        if (!Array.isArray(args) || args.length === 0) {
            return Promise.reject(new Error('ExifTool command must contain at least one argument.'));
        }
        if (args.some((argument) => typeof argument !== 'string')) {
            return Promise.reject(new TypeError('ExifTool command arguments must be strings.'));
        }
        if (this.queue.length >= this.maxQueueSize) {
            return Promise.reject(new Error(`ExifTool command queue exceeded maximum size (${this.maxQueueSize}).`));
        }

        const id = ++this.id;
        const commandArgs = [...args];

        return new Promise<string>((resolve, reject) => {
            this.queue.push({ args: commandArgs, resolve, reject, id });
            this.runNext();
        });
    }

    /* ----------------------- Public Metadata Operations ----------------------- */

    public async readMetadata(filePath: string): Promise<ExifRawRecord | null> {
        const metadataByFile = await this.readBatch([filePath]);
        return metadataByFile.get(path.resolve(filePath)) ?? null;
    }

    public async readBatch(filePaths: string[], chunkSize = 40): Promise<Map<string, ExifRawRecord>> {
        const metadataByFile = new Map<string, ExifRawRecord>();

        if (filePaths.length === 0) {
            return metadataByFile;
        }
        if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
            throw new RangeError('ExifTool chunkSize must be a positive integer.');
        }

        const normalizedPaths = filePaths.map((filePath) => path.resolve(filePath));

        for (let i = 0; i < normalizedPaths.length; i += chunkSize) {
            const chunk = normalizedPaths.slice(i, i + chunkSize);

            try {
                const output = await this.execute(['-j', '-charset', 'filename=utf8', ...chunk]);
                const records = JSON.parse(output) as ExifRawRecord[];

                if (!Array.isArray(records)) {
                    continue;
                }

                for (const record of records) {
                    const sourceFile = record.SourceFile;
                    if (typeof sourceFile === 'string' && sourceFile.length > 0) {
                        metadataByFile.set(path.resolve(sourceFile), record);
                    }
                }
            } catch (error) {
                if (chunk.length === 1) {
                    if (this.debug) {
                        console.warn(`[ExifClient] Failed reading ${chunk[0]}`, error);
                    }
                    continue;
                }

                // Retry files separately so one bad file does not discard the whole chunk.
                for (const filePath of chunk) {
                    try {
                        const output = await this.execute(['-j', '-charset', 'filename=utf8', filePath]);
                        const records = JSON.parse(output) as ExifRawRecord[];
                        const record = records[0];

                        if (record && typeof record.SourceFile === 'string') {
                            metadataByFile.set(path.resolve(record.SourceFile), record);
                        }
                    } catch (fileError) {
                        if (this.debug) {
                            console.warn(`[ExifClient] Failed reading ${filePath}`, fileError);
                        }
                    }
                }
            }
        }

        return metadataByFile;
    }

    /* ---------------------- Public Tag Write Operations ----------------------- */

    public async writeTags(filePath: string, tags: Record<string, ExifTagValue>, options: TagWriteOptions = {}): Promise<TagWriteResult> {
        const normalizedPath = path.resolve(filePath);
        const preserveOriginal = options.preserveOriginal ?? false;
        const preserveFileTimestamp = options.preserveFileTimestamp ?? true;

        try {
            await fs.promises.access(normalizedPath, fs.constants.F_OK);
        } catch {
            return {
                success: false,
                filePath: normalizedPath,
                updatedTags: tags,
                preserveOriginal,
                error: `File not found: ${normalizedPath}`,
            };
        }

        const args: string[] = ['-charset', 'filename=utf8'];
        if (!preserveOriginal) {
            args.push('-overwrite_original');
        }
        if (preserveFileTimestamp) {
            args.push('-P');
        }

        for (const [tag, value] of Object.entries(tags)) {
            if (!tag || tag.startsWith('-') || /[\r\n]/.test(tag)) {
                return {
                    success: false,
                    filePath: normalizedPath,
                    updatedTags: tags,
                    preserveOriginal,
                    error: `Invalid ExifTool tag name: ${JSON.stringify(tag)}`,
                };
            }

            if (value === null || value === '') {
                args.push(`-${tag}=`);
                continue;
            }

            if (Array.isArray(value)) {
                args.push(`-${tag}=`);
                for (const item of value) {
                    args.push(`-${tag}+=${item}`);
                }
                continue;
            }

            if (value !== undefined) {
                args.push(`-${tag}=${value}`);
            }
        }

        args.push(normalizedPath);

        try {
            await this.execute(args);

            const backupPath = `${normalizedPath}_original`;
            return {
                success: true,
                filePath: normalizedPath,
                updatedTags: tags,
                preserveOriginal,
                backupPath: preserveOriginal && fs.existsSync(backupPath) ? backupPath : undefined,
            };
        } catch (error) {
            return {
                success: false,
                filePath: normalizedPath,
                updatedTags: tags,
                preserveOriginal,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    public async writeTagsBatch(targets: BatchTagWriteTarget[], options: TagWriteOptions = {}): Promise<BatchTagWriteResult> {
        const succeeded: TagWriteResult[] = [];
        const failed: TagWriteResult[] = [];

        for (const target of targets) {
            const result = await this.writeTags(target.path, target.tags, options);
            (result.success ? succeeded : failed).push(result);
        }

        return {
            total: targets.length,
            succeeded,
            failed,
        };
    }

    public async ping(): Promise<boolean> {
        try {
            return (await this.execute(['-ver'])).trim().length > 0;
        } catch {
            return false;
        }
    }

    /* ---------------------- Process Lifecycle & Recovery ---------------------- */

    public close(): Promise<void> {
        if (this.closePromise) {
            return this.closePromise;
        }

        this.closePromise = this.shutdown();
        return this.closePromise;
    }

    private async shutdown(): Promise<void> {
        this.closing = true;
        const closeError = new Error('ExifClient closed.');

        for (const request of this.queue.splice(0)) {
            this.clearRequestTimeout(request);
            request.reject(closeError);
        }

        this.rejectCurrent(closeError);
        this.clearBuffers();

        if (this.toolProcess) {
            await this.stopProcess(this.toolProcess);
        }

        if (this.exitHandler) {
            process.removeListener('exit', this.exitHandler);
            this.exitHandler = null;
        }

        if (globalForExif.__exifClient === this) {
            globalForExif.__exifClient = undefined;
        }
    }

    private stopProcess(toolProcess: ChildProcessWithoutNullStreams): Promise<void> {
        return new Promise((resolve) => {
            let finished = false;

            const finish = () => {
                if (finished) {
                    return;
                }
                finished = true;
                clearTimeout(forceTimer);
                resolve();
            };

            const forceTimer = setTimeout(() => {
                this.killProcess(toolProcess, 'SIGKILL');
                finish();
            }, SHUTDOWN_TIMEOUT_MS);

            toolProcess.once('close', finish);

            if (toolProcess.exitCode !== null) {
                finish();
                return;
            }

            try {
                if (!toolProcess.stdin.writable) {
                    throw new Error('ExifTool stdin is already closed.');
                }
                toolProcess.stdin.write('-stay_open\nFalse\n', 'utf8');
            } catch {
                this.killProcess(toolProcess, 'SIGKILL');
                finish();
            }
        });
    }

    /* ----------------------- Stay-Open Execution Engine ----------------------- */

    private buildCommand(request: ExifCommandRequest): string {
        const encodedArgs = request.args.map((argument) => this.encodeArg(argument));
        const statusMarker = `__EXIF_STATUS_${request.id}_\${status}__`;

        return [...encodedArgs, '-echo3', statusMarker, `-execute${request.id}`, ''].join('\n');
    }

    private encodeArg(argument: string): string {
        if (argument.includes('\0')) {
            throw new Error('ExifTool arguments cannot contain null bytes.');
        }

        const escaped = argument.replace(/\\/g, '\\\\').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');

        return `#[CSTR]${escaped}`;
    }

    private parseOutput(rawOutput: string, id: number): { output: string; status: number } | null {
        const markerPattern = new RegExp(`(?:^|\\n)__EXIF_STATUS_${id}_(\\d+)__\\s*$`);
        const match = rawOutput.match(markerPattern);

        if (!match || match.index === undefined) {
            return null;
        }

        return {
            output: rawOutput.slice(0, match.index).trim(),
            status: Number(match[1]),
        };
    }

    private rejectCurrent(error: Error): void {
        const request = this.currentRequest;
        if (!request) {
            return;
        }

        this.currentRequest = null;
        this.clearRequestTimeout(request);
        this.clearBuffers();
        request.reject(error);
    }

    private resolveCurrent(output: string): void {
        const request = this.currentRequest;
        if (!request) {
            return;
        }

        this.currentRequest = null;
        this.clearRequestTimeout(request);
        this.clearBuffers();
        request.resolve(output);
    }

    private handleTimeout(request: ExifCommandRequest): void {
        if (this.currentRequest !== request) {
            return;
        }

        const error = new Error(`ExifTool execution timed out after ${this.timeoutMs}ms (request ${request.id}).`);

        this.resetProcess(this.toolProcess);
        this.rejectCurrent(error);
        this.runNext();
    }

    private clearBuffers(): void {
        this.outputBuffer = '';
        this.outputBytes = 0;
        this.errorBuffer = '';
    }

    private clearRequestTimeout(request: ExifCommandRequest): void {
        if (request.timeoutId) {
            clearTimeout(request.timeoutId);
            request.timeoutId = undefined;
        }
    }

    private captureStderr(chunk: string): void {
        this.errorBuffer += chunk;
        if (this.errorBuffer.length > MAX_ERROR_BYTES) {
            this.errorBuffer = this.errorBuffer.slice(-MAX_ERROR_BYTES);
        }
    }

    private resetProcess(toolProcess: ChildProcessWithoutNullStreams | null): void {
        if (toolProcess && this.toolProcess === toolProcess) {
            this.toolProcess = null;
        }

        this.clearBuffers();
        this.killProcess(toolProcess, 'SIGKILL');
    }

    private killProcess(toolProcess: ChildProcessWithoutNullStreams | null, signal: NodeJS.Signals): void {
        if (!toolProcess || toolProcess.killed) {
            return;
        }

        try {
            toolProcess.kill(signal);
        } catch {
            // The process may already be gone.
        }
    }

    private registerExitHook(): void {
        const cleanup = () => this.killProcess(this.toolProcess, 'SIGKILL');
        this.exitHandler = cleanup;
        process.once('exit', cleanup);
    }
}

/* ----------------------- Singleton Instance Access ------------------------ */

const globalForExif = globalThis as typeof globalThis & {
    __exifClient?: ExifClient;
};

export function getExifClient(options?: ExifClientOptions): ExifClient {
    if (!globalForExif.__exifClient) {
        globalForExif.__exifClient = new ExifClient(options);
    }

    return globalForExif.__exifClient;
}
