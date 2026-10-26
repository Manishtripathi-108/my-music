import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import 'server-only';

import { serverEnv } from '@/config/env.server';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/server/api/errors';

const WINDOWS_RESERVED_DEVICE_NAMES = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;

/**
 * Checks whether targetPath is contained within rootPath using platform-aware relative boundaries.
 * Case-insensitive on Windows to prevent casing bypasses.
 */
function isContainedWithin(rootPath: string, targetPath: string): boolean {
    const root = process.platform === 'win32' ? rootPath.toLowerCase() : rootPath;
    const target = process.platform === 'win32' ? targetPath.toLowerCase() : targetPath;

    const rel = path.relative(root, target);
    return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/**
 * Asserts that the canonical path resides inside one of the configured ALLOWED_MEDIA_ROOTS.
 */
function assertInsideAllowedRoots(canonicalPath: string): void {
    const roots = serverEnv.ALLOWED_MEDIA_ROOTS;
    if (!roots || roots.length === 0) {
        throw new ForbiddenError('No allowed media roots configured on server');
    }

    const isAllowed = roots.some((root) => {
        const canonicalRoot = path.resolve(root);
        return isContainedWithin(canonicalRoot, canonicalPath);
    });

    if (!isAllowed) {
        throw new ForbiddenError(`Access denied: path is outside configured media roots`);
    }
}

function sanitizeAndResolvePath(rawPath: string): string {
    if (!rawPath || rawPath.includes('\0')) {
        throw new BadRequestError('Path is empty or contains illegal null byte character');
    }

    const normalized = path.normalize(rawPath);
    const baseName = path.basename(normalized);
    if (WINDOWS_RESERVED_DEVICE_NAMES.test(baseName)) {
        throw new BadRequestError(`Path references reserved device name: "${baseName}"`);
    }

    return path.resolve(normalized);
}

/**
 * Validates, canonicalizes, and authorizes an input audio file path.
 *
 * @param rawPath - Client-supplied file path string.
 * @returns Canonical, realpath-resolved absolute path.
 * @throws BadRequestError on null bytes, reserved names, or non-file paths.
 * @throws NotFoundError if the file does not exist on disk.
 * @throws ForbiddenError if the file lies outside ALLOWED_MEDIA_ROOTS.
 */
export async function authorizeInputPath(rawPath: string): Promise<string> {
    const resolved = sanitizeAndResolvePath(rawPath);

    let realPath: string;
    try {
        realPath = await fs.promises.realpath(resolved);
    } catch {
        throw new NotFoundError(`Audio file not found: "${resolved}"`);
    }

    let stats: fs.Stats;
    try {
        stats = await fs.promises.stat(realPath);
    } catch {
        throw new NotFoundError(`Audio file not found: "${realPath}"`);
    }

    if (!stats.isFile()) {
        throw new BadRequestError(`Target path is not a regular file: "${realPath}"`);
    }

    assertInsideAllowedRoots(realPath);
    return realPath;
}

/**
 * Validates, canonicalizes, and authorizes a destination output file path.
 * Protects against symlink overwrite attacks if the target already exists.
 *
 * @param rawPath - Client-supplied destination path string.
 * @returns Validated absolute output destination path.
 * @throws BadRequestError on null bytes, reserved names, or invalid destination folder.
 * @throws ForbiddenError if the destination lies outside ALLOWED_MEDIA_ROOTS.
 */
export async function authorizeOutputPath(rawPath: string): Promise<string> {
    const resolved = sanitizeAndResolvePath(rawPath);

    // If output destination already exists on disk, check for symlink hijacking
    try {
        const lstats = await fs.promises.lstat(resolved);
        if (lstats.isSymbolicLink()) {
            const symlinkTarget = await fs.promises.realpath(resolved);
            assertInsideAllowedRoots(symlinkTarget);
            return resolved;
        }

        const realExisting = await fs.promises.realpath(resolved);
        assertInsideAllowedRoots(realExisting);
        return resolved;
    } catch {
        // File does not exist yet; verify parent directory
    }

    const parentDir = path.dirname(resolved);
    let realParentDir: string;
    try {
        realParentDir = await fs.promises.realpath(parentDir);
    } catch {
        throw new BadRequestError(`Destination directory does not exist: "${parentDir}"`);
    }

    assertInsideAllowedRoots(realParentDir);
    return path.join(realParentDir, path.basename(resolved));
}
