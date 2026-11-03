import 'server-only';

import { FFprobeAdapter } from './adapters/ffprobe.adapter';
import { MediaInfoAdapter } from './adapters/mediainfo.adapter';
import { TagLibAdapter } from './adapters/taglib.adapter';
import { MediaConverter } from './media-converter';
import { type EngineHealth, type HealthStatus, type ToolHealth, mergeHealthStatus } from './tool-inspector';
import type { ToolHealthProvider } from './types';

export type { Engine, HealthStatus, ToolHealth } from './tool-inspector';

export interface MetadataEngineHealth extends EngineHealth {
    tools: {
        taglib: ToolHealth;
    };
}

export interface ProbingEngineHealth extends EngineHealth {
    tools: {
        ffprobe: ToolHealth;
        mediaInfo: ToolHealth;
    };
}

export interface ConversionEngineHealth extends EngineHealth {
    tools: {
        ffmpeg: ToolHealth;
    };
}

export interface MediaDiagnosticsReport {
    status: HealthStatus;
    engines: {
        metadata: MetadataEngineHealth;
        probing: ProbingEngineHealth;
        conversion: ConversionEngineHealth;
    };
    warnings: string[];
    timestamp: string;
}

/**
 * Aggregates health diagnostics from all media engine adapters.
 *
 * All tool inspections run in parallel via instance methods.
 * Adapters may be injected for unit testing or custom environments.
 */
export async function getMediaDiagnostics(
    taglib: ToolHealthProvider = new TagLibAdapter(),
    ffprobe: ToolHealthProvider = new FFprobeAdapter(),
    mediaInfo: ToolHealthProvider = new MediaInfoAdapter(),
    converter: ToolHealthProvider = new MediaConverter()
): Promise<MediaDiagnosticsReport> {
    const [taglibHealth, ffprobeHealth, mediaInfoHealth, ffmpegHealth] = await Promise.all([
        taglib.getToolHealth(),
        ffprobe.getToolHealth(),
        mediaInfo.getToolHealth(),
        converter.getToolHealth(),
    ]);

    const metadataStatus = taglibHealth.status;
    const probingStatus = mergeHealthStatus([ffprobeHealth.status, mediaInfoHealth.status]);
    const conversionStatus = ffmpegHealth.status;
    const overallStatus = mergeHealthStatus([metadataStatus, probingStatus, conversionStatus]);

    const warnings = collectWarnings({
        taglib: taglibHealth,
        ffprobe: ffprobeHealth,
        mediaInfo: mediaInfoHealth,
        ffmpeg: ffmpegHealth,
    });

    return {
        status: overallStatus,
        engines: {
            metadata: { status: metadataStatus, tools: { taglib: taglibHealth } },
            probing: { status: probingStatus, tools: { ffprobe: ffprobeHealth, mediaInfo: mediaInfoHealth } },
            conversion: { status: conversionStatus, tools: { ffmpeg: ffmpegHealth } },
        },
        warnings,
        timestamp: new Date().toISOString(),
    };
}

function collectWarnings(tools: { taglib: ToolHealth; ffprobe: ToolHealth; mediaInfo: ToolHealth; ffmpeg: ToolHealth }): string[] {
    const warnings: string[] = [];

    for (const [engine, toolName, tool] of [
        ['metadata', 'taglib', tools.taglib],
        ['probing', 'ffprobe', tools.ffprobe],
        ['probing', 'mediaInfo', tools.mediaInfo],
        ['conversion', 'ffmpeg', tools.ffmpeg],
    ] as const) {
        if (tool.configured === tool.active) continue;

        if (tool.active === 'wasm') {
            const nativePath = tool.implementations.native.path ?? 'not configured';
            warnings.push(`Native ${engine} tool '${toolName}' is unavailable at '${nativePath}'. WASM fallback is active.`);
        } else if (tool.active === 'native') {
            warnings.push(`WASM ${engine} tool '${toolName}' is unavailable. Native fallback is active.`);
        }
    }

    return warnings;
}
