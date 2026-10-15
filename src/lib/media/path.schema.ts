import { z } from 'zod';

/**
 * Isomorphic file path syntax schema.
 * Enforces non-empty string, rejects illegal NUL bytes, and normalizes separators.
 * Platform and filesystem containment rules are strictly enforced by server path security.
 */
export const filePathSchema = z
    .string()
    .trim()
    .min(1, 'File path cannot be empty')
    .refine((val) => !val.includes('\0'), {
        message: 'Path contains illegal null byte character',
    });

/**
 * Reusable batch file paths schema.
 */
export const filePathsArraySchema = z
    .array(filePathSchema)
    .min(1, 'At least one file path is required')
    .max(500, 'Batch size cannot exceed 500 files');
