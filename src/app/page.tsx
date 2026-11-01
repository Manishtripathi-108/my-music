import Topbar from '@/components/layout/Topbar';
import { ScanLibraryButton, ScanModal } from '@/features/scanner';

/**
 * Application landing page featuring top navigation and centered scan modal launcher.
 */
export default function Home() {
    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col font-mono select-none">
            <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-16 sm:px-6 lg:px-8">
                {/* Floating, Rounded Topbar */}
                <Topbar />

                {/* Main Content Area: Centered Scan Modal Trigger Only */}
                <main className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
                    <div className="flex flex-col items-center justify-center gap-6 text-center">
                        <ScanLibraryButton
                            variant="primary"
                            size="xl"
                            className="gap-3.5 rounded-2xl px-8 py-5 text-sm font-semibold tracking-wider shadow-md transition-all duration-200 hover:shadow-lg active:shadow-inner">
                            <span>SCAN LIBRARY</span>
                        </ScanLibraryButton>
                    </div>
                </main>

                {/* Global ScanModal mounted on the page */}
                <ScanModal />
            </div>
        </div>
    );
}
