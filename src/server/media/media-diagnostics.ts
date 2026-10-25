import 'server-only';

import { FFprobeAdapter } from './adapters/ffprobe.adapter';
import { MediaInfoAdapter } from './adapters/mediainfo.adapter';
import { TagLibAdapter } from './adapters/taglib.adapter';
import { MediaConverter } from './media-converter';
import { type EngineHealth, type HealthStatus, type ToolHealth, mergeHealthStatus } from './tool-inspector';

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
 * All native tool inspections run in parallel.
 * Each adapter owns its engine configuration and implementation availability.
 */
export async function getMediaDiagnostics(): Promise<MediaDiagnosticsReport> {
    const [taglib, ffprobe, mediaInfo, ffmpeg] = await Promise.all([
        TagLibAdapter.getToolHealth(),
        FFprobeAdapter.getToolHealth(),
        MediaInfoAdapter.getToolHealth(),
        MediaConverter.getToolHealth(),
    ]);

    const metadataStatus = taglib.status;
    const probingStatus = mergeHealthStatus([ffprobe.status, mediaInfo.status]);
    const conversionStatus = ffmpeg.status;
    const overallStatus = mergeHealthStatus([metadataStatus, probingStatus, conversionStatus]);

    const warnings = collectWarnings({ taglib, ffprobe, mediaInfo, ffmpeg });

    return {
        status: overallStatus,
        engines: {
            metadata: { status: metadataStatus, tools: { taglib } },
            probing: { status: probingStatus, tools: { ffprobe, mediaInfo } },
            conversion: { status: conversionStatus, tools: { ffmpeg } },
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
