import { NextResponse } from 'next/server';

import fs from 'node:fs';
import { Readable } from 'node:stream';

import { type ExtractedArtwork, artworkExtractRequestSchema, artworkQuerySchema, tagsQuerySchema } from '@/features/media';
import { metadataCoordinator } from '@/features/media/server';
import { apiNoContent, apiNotFound, apiSuccess, handleRouteError } from '@/server/api';

/* ---------------------- Stream Artwork Binary (GET) ----------------------- */

/**
 * GET /api/media/artwork?file=hash.jpg
 * or
 * GET /api/media/artwork?path=/path/to/song.mp3
 *
 * Streams cached artwork directly as binary image with HTTP caching headers.
 */
export async function GET(request: Request): Promise<NextResponse | Response> {
    try {
        const { searchParams } = new URL(request.url);
        const query = artworkQuerySchema.parse({
            path: searchParams.get('path') ?? undefined,
            file: searchParams.get('file') ?? undefined,
        });

        const artwork: ExtractedArtwork | null = await metadataCoordinator.findArtwork(query);

        if (!artwork) {
            return apiNotFound('No album artwork available for the specified query');
        }

        const nodeStream = fs.createReadStream(artwork.cachedPath);
        const stream = Readable.toWeb(nodeStream) as ReadableStream;

        return new Response(stream, {
            status: 200,
            headers: {
                'Content-Type': artwork.mimeType,
                'Content-Length': String(artwork.sizeBytes),
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Disposition': `inline; filename="${artwork.filename}"`,
            },
        });
    } catch (error) {
        return handleRouteError(error, 'Failed to fetch artwork image');
    }
}

/* -------------------- Extract Artwork Metadata (JSON) --------------------- */

/**
 * POST /api/media/artwork
 * Body: { path: string, forceRefresh?: boolean }
 *
 * Extracts embedded artwork from an audio file, persists it to disk cache,
 * and returns JSON metadata.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const input = artworkExtractRequestSchema.parse(body);

        const artwork: ExtractedArtwork | null = await metadataCoordinator.extractArtwork(input.path, input.forceRefresh);

        if (!artwork) {
            return apiNotFound('No embedded artwork found in this audio file');
        }

        return apiSuccess(artwork, {
            message: 'Artwork extracted successfully',
        });
    } catch (error) {
        return handleRouteError(error, 'Failed to extract album artwork');
    }
}

/* --------------------- Remove Artwork Picture (DELETE) -------------------- */

/**
 * DELETE /api/media/artwork?path=/path/to/song.mp3
 * Removes embedded artwork from the audio file and purges cache.
 */
export async function DELETE(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const { path } = tagsQuerySchema.parse({
            path: searchParams.get('path') ?? undefined,
        });

        await metadataCoordinator.removeArtwork(path);
        return apiNoContent();
    } catch (error) {
        return handleRouteError(error, 'Failed to remove album artwork');
    }
}
