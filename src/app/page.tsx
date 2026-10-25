import Topbar from '@/components/layout/Topbar';
import Icon from '@/components/ui/Icon';
import { ScanLibraryButton, ScannerDashboard } from '@/features/scanner';

export default function Home() {
    return (
        <div className="bg-background relative min-h-screen overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="from-primary/10 pointer-events-none absolute inset-x-0 -top-48 h-96 bg-linear-to-b to-transparent blur-3xl" />

            {/* Persistent Top Navigation Bar */}
            <Topbar actions={<ScanLibraryButton />} />

            <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pt-4 pb-24 sm:px-6 lg:px-8">
                <main className="flex flex-1 flex-col justify-center gap-8 py-6">
                    {/* Interactive Scanner Hero & Active Session Section */}
                    <ScannerDashboard />

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
        </div>
    );
}
