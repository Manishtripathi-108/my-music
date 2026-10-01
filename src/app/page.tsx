'use client';

import React, { useState } from 'react';

import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { ScanModal, type ScanResponseData, useScanModalStore } from '@/features/scanner';
import { formatTime } from '@/lib/format';

export default function Home() {
    const { openModal: openScanModal } = useScanModalStore();
    const [lastScan, setLastScan] = useState<ScanResponseData | null>(null);

    return (
        <div className="bg-background relative min-h-screen overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="from-primary/10 pointer-events-none absolute inset-x-0 -top-48 h-96 bg-linear-to-b to-transparent blur-3xl" />

            {/* Persistent Top Navigation Bar */}
            <Topbar />

            <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pt-4 pb-24 sm:px-6 lg:px-8">
                <main className="flex flex-1 flex-col justify-center gap-8 py-6">
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

                    {/* Supported Features Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="bg-card text-card-foreground rounded-2xl border p-5 shadow-xs">
                            <div className="bg-primary/10 text-primary mb-3 flex size-9 items-center justify-center rounded-xl">
                                <Icon icon="playlist" className="size-5" />
                            </div>
                            <h3 className="text-foreground text-sm font-bold">Multiple Scan Modes</h3>
                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                Choose between fast incremental scans, deep full rebuilds, or error-targeted retries.
                            </p>
                        </div>

                        <div className="bg-card text-card-foreground rounded-2xl border p-5 shadow-xs">
                            <div className="bg-primary/10 text-primary mb-3 flex size-9 items-center justify-center rounded-xl">
                                <Icon icon="folderOpen" className="size-5" />
                            </div>
                            <h3 className="text-foreground text-sm font-bold">Recursive Directory Traversal</h3>
                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                Automatically crawl nested artist, album, and disc folders with path normalization.
                            </p>
                        </div>

                        <div className="bg-card text-card-foreground rounded-2xl border p-5 shadow-xs">
                            <div className="bg-primary/10 text-primary mb-3 flex size-9 items-center justify-center rounded-xl">
                                <Icon icon="check" className="size-5" />
                            </div>
                            <h3 className="text-foreground text-sm font-bold">Zod Validated & Typed</h3>
                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                Shared client & server schema validation ensuring strictly typed parameters over Axios.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-muted-foreground mt-auto flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs sm:flex-row">
                    <p>© 2026 My Music • Audio Engine & Library Scanner</p>
                    <div className="flex items-center gap-4">
                        <span>Zod v4</span>
                        <span>•</span>
                        <span>Axios</span>
                        <span>•</span>
                        <span>Next.js App Router</span>
                    </div>
                </footer>
            </div>

            {/* SCAN MODAL COMPONENT */}
            <ScanModal onScanSuccess={(data) => setLastScan(data)} />
        </div>
    );
}
