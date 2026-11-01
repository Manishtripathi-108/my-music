'use client';

import React, { useState } from 'react';

import axios from 'axios';
import { goeyToast } from 'goey-toast';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import cn from '@/lib/cn';
import { formatTime } from '@/lib/format';
import type { ApiSuccess } from '@/types/api';

import { useScanModalStore } from '../hooks/use-scan-modal-store';
import type { ScanMode } from '../schemas/scan-request.schema';
import type { ScanResponseData } from '../types';
import { ScanModal } from './ScanModal';

interface AudioCodecItem {
    id: string;
    name: string;
    engine: string;
}

const audioCodecs: AudioCodecItem[] = [
    { id: 'flac', name: 'FLAC', engine: 'TagLib 2.x' },
    { id: 'alac', name: 'ALAC', engine: 'TagLib 2.x' },
    { id: 'wav', name: 'WAV', engine: 'RIFF INFO' },
    { id: 'dsd', name: 'DSD', engine: 'Direct Stream' },
    { id: 'aiff', name: 'AIFF', engine: 'ID3v2' },
    { id: 'opus', name: 'Opus', engine: 'Vorbis' },
    { id: 'aac', name: 'AAC', engine: 'MP4 covr' },
    { id: 'mp3', name: 'MP3', engine: 'ID3v2.4' },
    { id: 'pcm', name: 'PCM', engine: 'Linear PCM' },
    { id: 'ogg', name: 'Ogg', engine: 'Vorbis' },
    { id: 'm4a', name: 'M4A', engine: 'Apple Lossless' },
];

interface ScanProfileItem {
    id: ScanMode;
    label: string;
    description: string;
    affect: string;
}

const scanProfiles: ScanProfileItem[] = [
    {
        id: 'addNew',
        label: 'Fast Sync',
        description: 'Rapid incremental sync of new tracks without re-reading existing audio.',
        affect: 'High-throughput stream indexing; skips previously validated lossless files.',
    },
    {
        id: 'forceAll',
        label: 'Deep Rebuild',
        description: 'Complete forensic rebuild of tags, elementary streams, and cover art.',
        affect: 'Full Bit-for-bit extraction; regenerative checksum verification across all subdirectories.',
    },
    {
        id: 'rescanErrors',
        label: 'Targeted Fix',
        description: 'Retries corrupt headers, unreadable tags, or encoding anomalies.',
        affect: 'Selective recovery pipeline; focuses strictly on failed catalog entries.',
    },
];

/**
 * Interactive media scanner dashboard with audio codec selector chips,
 * execution profiles, live execution telemetry, and modal triggers.
 */
export function ScannerDashboard() {
    const { openModal: openScanModal } = useScanModalStore();
    const [selectedCodec, setSelectedCodec] = useState<string>('flac');
    const [selectedProfile, setSelectedProfile] = useState<ScanMode>('addNew');
    const [targetDirectory, setTargetDirectory] = useState<string>('music-files');
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [lastScan, setLastScan] = useState<ScanResponseData | null>(null);

    const activeProfileData = scanProfiles.find((p) => p.id === selectedProfile) ?? scanProfiles[0];

    const handleRandomize = () => {
        const randomCodec = audioCodecs[Math.floor(Math.random() * audioCodecs.length)].id;
        const randomProfile = scanProfiles[Math.floor(Math.random() * scanProfiles.length)].id;
        setSelectedCodec(randomCodec);
        setSelectedProfile(randomProfile);
        goeyToast.info('Profile Randomized', {
            description: `Active codec: ${randomCodec.toUpperCase()} • Profile: ${randomProfile}`,
        });
    };

    const handleQuickScan = async () => {
        setIsScanning(true);
        try {
            const response = await axios.post<ApiSuccess<ScanResponseData>>('/api/scan', {
                directory: targetDirectory,
                scanMode: selectedProfile,
                recursive: true,
            });

            if (response.data.success) {
                const data = response.data.data;
                setLastScan(data);
                goeyToast.success('Library Scan Started', {
                    description: `Job ID: ${data.scanId} • Target: ${data.directory}`,
                });
            }
        } catch (error) {
            goeyToast.error('Scan Failed', {
                description: error instanceof Error ? error.message : 'Failed to trigger scan request',
            });
        } finally {
            setIsScanning(false);
        }
    };

    const handleExportLogs = () => {
        if (!lastScan) {
            goeyToast.info('No Active Scan Session', {
                description: 'Run a library scan first to export telemetry logs.',
            });
            return;
        }

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lastScan, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `scan-log-${lastScan.scanId}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        goeyToast.success('Telemetry Exported', {
            description: `Saved scan-log-${lastScan.scanId}.json to your machine.`,
        });
    };

    return (
        <div className="flex flex-col gap-6 font-mono text-xs select-none">
            {/* Audio Engine Codec Selector Chips */}
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">AUDIO ENGINE CODECS</span>
                    <span className="text-muted-foreground text-[10px]">{selectedCodec.toUpperCase()} ACTIVE</span>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                    {audioCodecs.map((codec) => {
                        const isSelected = selectedCodec === codec.id;
                        return (
                            <button
                                key={codec.id}
                                type="button"
                                onClick={() => setSelectedCodec(codec.id)}
                                className={cn(
                                    'bg-card text-card-foreground relative flex h-17 cursor-pointer flex-col justify-between rounded-lg p-2.5 text-left shadow-sm transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none hover:shadow-md hover:brightness-[1.02] active:scale-[0.985] active:shadow-inner active:inset-shadow-xs',
                                    isSelected && 'ring-primary/40 ring-1'
                                )}>
                                <span className="text-foreground text-xs font-semibold tracking-tight">{codec.name}</span>

                                <div className="flex w-full items-center justify-between pt-1">
                                    {/* Tactile indicator dot */}
                                    <span
                                        className={cn(
                                            'size-1.5 rounded-full transition-colors',
                                            isSelected ? 'bg-primary shadow-xs' : 'bg-neutral-300 dark:bg-neutral-600'
                                        )}
                                    />
                                    <span className="text-muted-foreground/60 text-[10px]">✧</span>
                                </div>
                            </button>
                        );
                    })}

                    {/* Shuffle / Randomize Card */}
                    <button
                        type="button"
                        onClick={handleRandomize}
                        title="Randomize active format & profile"
                        className="flex h-17 cursor-pointer items-center justify-center rounded-lg bg-neutral-300 text-white shadow-sm transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none hover:bg-neutral-400/80 hover:shadow-md hover:brightness-[1.03] active:scale-[0.985] active:shadow-inner active:inset-shadow-xs dark:bg-neutral-700 dark:hover:bg-neutral-600">
                        <Icon icon="shuffle" className="size-4.5" />
                    </button>
                </div>
            </div>

            {/* Profiles & Target Workspace Workbench */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* LEFT COLUMN: SCAN PROFILES & TECHNICAL PARAMETERS */}
                <div className="flex flex-col gap-4 lg:col-span-5">
                    {/* Profiles Header */}
                    <div className="flex flex-col gap-2">
                        <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">SCAN PROFILE</span>

                        <div className="grid grid-cols-3 gap-2">
                            {scanProfiles.map((profile) => {
                                const isSelected = selectedProfile === profile.id;
                                return (
                                    <button
                                        key={profile.id}
                                        type="button"
                                        onClick={() => setSelectedProfile(profile.id)}
                                        className={cn(
                                            'bg-card text-card-foreground relative flex h-17 cursor-pointer flex-col justify-between rounded-lg p-2.5 text-left shadow-sm transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none hover:shadow-md hover:brightness-[1.02] active:scale-[0.985] active:shadow-inner active:inset-shadow-xs',
                                            isSelected && 'ring-primary/40 ring-1'
                                        )}>
                                        <span className="text-foreground text-xs leading-tight font-semibold">{profile.label}</span>

                                        <div className="flex w-full items-center justify-between pt-1">
                                            <span
                                                className={cn(
                                                    'size-1.5 rounded-full transition-colors',
                                                    isSelected ? 'bg-primary shadow-xs' : 'bg-neutral-300 dark:bg-neutral-600'
                                                )}
                                            />
                                            <span className="text-muted-foreground/60 text-[10px]">✧</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Technical Telemetry / Affect Console Box */}
                    <div className="bg-card text-card-foreground text-muted-foreground flex flex-1 flex-col justify-center gap-2 rounded-xl p-4 text-[11px] leading-relaxed shadow sm:text-[12px]">
                        <p>
                            <span className="text-foreground font-semibold">Engine Affect:</span> {activeProfileData.affect}
                        </p>
                        <p>
                            <span className="text-foreground font-semibold">Forensics:</span> FFprobe 9.0 stream parsing + MediaInfo true bit-depth
                            verification.
                        </p>
                        <p>
                            <span className="text-foreground font-semibold">Safety Boundary:</span> Atomic temporary staging with crash-safe rename
                            and pre-write cache purge.
                        </p>
                    </div>
                </div>

                {/* RIGHT COLUMN: SCRIPT / TARGET WORKSPACE CARD */}
                <div className="flex flex-col gap-2 lg:col-span-7">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">TARGET WORKSPACE</span>
                        <span className="text-muted-foreground text-[10px]">RECURSIVE TRAVERSAL</span>
                    </div>

                    <div className="bg-card text-card-foreground relative flex min-h-[190px] flex-col justify-between rounded-xl p-5 shadow">
                        <div className="flex flex-col gap-3">
                            <div className="bg-input flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 shadow-inner">
                                <Icon icon="folderOpen" className="text-muted-foreground size-4 shrink-0" />
                                <input
                                    type="text"
                                    value={targetDirectory}
                                    onChange={(e) => setTargetDirectory(e.target.value)}
                                    placeholder="Enter library directory (e.g. music-files or D:/Music)"
                                    className="text-foreground w-full bg-transparent text-xs font-semibold shadow-none outline-none sm:text-sm"
                                />
                            </div>

                            <p className="text-muted-foreground text-[11px] leading-relaxed sm:text-xs">
                                High-fidelity lossless audio engine target configured. TagLib 2.x will extract metadata, normalize ID3v2/Vorbis/MP4
                                tags without re-encoding bitstreams, and cache high-resolution embedded album covers in{' '}
                                <code className="text-foreground">cache/art/</code>.
                            </p>
                        </div>

                        {/* Quick Targets & Length Badge */}
                        <div className="mt-2 flex items-center justify-between pt-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground text-[10px]">QUICK:</span>
                                {['music-files', 'music-files/flac'].map((dir) => (
                                    <button
                                        key={dir}
                                        type="button"
                                        onClick={() => setTargetDirectory(dir)}
                                        className={cn(
                                            'cursor-pointer rounded-md px-2 py-0.5 text-[10px] transition-colors',
                                            targetDirectory === dir
                                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                                : 'bg-muted hover:bg-accent text-foreground'
                                        )}>
                                        {dir}
                                    </button>
                                ))}
                            </div>

                            <span className="text-muted-foreground font-mono text-[11px]">{targetDirectory.length} chars</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Triggers */}
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-12">
                {/* Download / Export Button */}
                <Button type="button" variant="slate" size="xl" onClick={handleExportLogs} className="sm:col-span-3">
                    <Icon icon="download" className="size-4.5" />
                    DOWNLOAD
                </Button>

                {/* Share / Config Modal Button */}
                <Button type="button" variant="dark" size="xl" onClick={openScanModal} className="sm:col-span-3">
                    <Icon icon="upload" className="size-4.5" />
                    CONFIGURE
                </Button>

                {/* Big Hero Play / Scan Button */}
                <Button
                    type="button"
                    variant="primary"
                    size="xl"
                    disabled={isScanning}
                    onClick={handleQuickScan}
                    className="shadow-md hover:shadow-lg sm:col-span-6">
                    <Icon icon={isScanning ? 'loading' : 'play'} className="size-5" />
                    {isScanning ? 'SCANNING ACTIVE...' : 'START SCAN'}
                </Button>
            </div>

            {/* Recent Scan Status Telemetry */}
            {lastScan && (
                <div className="bg-card text-card-foreground mt-2 rounded-xl p-5 shadow">
                    <div className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary size-2 animate-pulse rounded-full shadow-xs" />
                            <div>
                                <span className="text-foreground text-sm font-bold">Active Library Session</span>
                                <p className="text-muted-foreground text-[11px]">{lastScan.scanId}</p>
                            </div>
                        </div>
                        <span className="text-muted-foreground text-[11px]">{formatTime(lastScan.timestamp)}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-2 text-[11px] sm:grid-cols-3">
                        <div>
                            <span className="text-muted-foreground block text-[10px]">DIRECTORY</span>
                            <span className="text-foreground block truncate font-semibold">{lastScan.directory}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[10px]">MODE</span>
                            <span className="text-foreground font-semibold capitalize">{lastScan.scanMode}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[10px]">TRAVERSAL</span>
                            <span className="text-foreground font-semibold">
                                {lastScan.recursive ? 'Recursive (All Subdirectories)' : 'Top-level Only'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Comprehensive Scan Modal */}
            <ScanModal onScanSuccess={(data) => setLastScan(data)} />
        </div>
    );
}

export default ScannerDashboard;
