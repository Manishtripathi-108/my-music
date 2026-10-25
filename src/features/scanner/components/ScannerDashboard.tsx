'use client';

import React, { useState } from 'react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { formatTime } from '@/lib/format';

import { ScanModal } from './ScanModal';
import { useScanModalStore } from '../hooks/use-scan-modal-store';
import type { ScanResponseData } from '../types';

export function ScannerDashboard() {
    const { openModal: openScanModal } = useScanModalStore();
    const [lastScan, setLastScan] = useState<ScanResponseData | null>(null);

    return (
        <>
            {/* Central Hero Card with Scan Button */}
            <div className="bg-card text-card-foreground motion-preset-slide-up-sm motion-duration-500 relative overflow-hidden rounded-3xl border p-8 shadow-sm sm:p-12">
                <div className="from-primary/5 absolute -top-24 -right-24 size-96 rounded-full bg-radial to-transparent blur-2xl" />

                <div className="relative flex flex-col items-center text-center">
                    <div className="bg-primary/10 text-primary mb-6 flex size-20 items-center justify-center rounded-3xl shadow-sm">
                        <Icon icon="audio" className="size-10" />
                    </div>

                    <Badge variant="primary" size="sm" className="mb-4">
                        Zod & Axios Powered Indexer
                    </Badge>

                    <h2 className="text-foreground max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">Index Your Music Library</h2>

                    <p className="text-muted-foreground mt-3 max-w-lg text-sm leading-relaxed sm:text-base">
                        Scan local directories for FLAC, WAV, ALAC, and DSD lossless audio. Extract metadata, build catalog tags, and verify
                        file checksums.
                    </p>

                    {/* PRIMARY SCAN TRIGGER BUTTON */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            size="lg"
                            onClick={openScanModal}
                            className="gap-2.5 px-6 py-6 text-base font-bold shadow-md transition-all hover:shadow-lg">
                            <Icon icon="refresh" className="size-5" />
                            Scan Music Library
                        </Button>
                    </div>
                </div>
            </div>

            {/* Recent Scan Status Card (Displays when a scan has been submitted) */}
            {lastScan && (
                <div className="bg-card text-card-foreground motion-preset-fade motion-duration-300 border-primary/30 rounded-2xl border p-6 shadow-xs">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-success/10 text-success flex size-10 items-center justify-center rounded-xl">
                                <Icon icon="check" className="size-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-foreground text-sm font-bold">Active Scan Session</p>
                                    <Badge variant="solid" size="xs">
                                        QUEUED
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground font-mono text-xs">{lastScan.scanId}</p>
                            </div>
                        </div>

                        <div className="text-muted-foreground text-xs">{formatTime(lastScan.timestamp)}</div>
                    </div>

                    <div className="bg-background mt-4 grid grid-cols-1 gap-3 rounded-xl border p-4 text-xs sm:grid-cols-3">
                        <div>
                            <span className="text-muted-foreground text-[11px]">Target Directory</span>
                            <p className="text-foreground truncate font-mono font-medium">{lastScan.directory}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-[11px]">Scan Mode</span>
                            <p className="text-foreground font-medium capitalize">{lastScan.scanMode}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-[11px]">Recursive Traversal</span>
                            <p className="text-foreground font-medium">
                                {lastScan.recursive ? 'Enabled (All Subfolders)' : 'Disabled (Root Only)'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* SCAN MODAL COMPONENT */}
            <ScanModal onScanSuccess={(data) => setLastScan(data)} />
        </>
    );
}

export default ScannerDashboard;
