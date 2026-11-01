import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

/**
 * Segment 404 fallback page rendered when a resource is not found.
 */
export default function NotFound() {
    return (
        <div className="bg-background relative flex min-h-screen flex-col items-center justify-center p-6 text-center font-mono">
            <div className="from-primary/10 pointer-events-none absolute inset-x-0 -top-48 h-96 bg-linear-to-b to-transparent blur-3xl" />

            <div className="bg-card text-card-foreground motion-preset-slide-up-sm relative z-10 max-w-md rounded-3xl p-8 shadow-xl">
                <div className="bg-primary/10 text-primary mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl shadow-xs">
                    <Icon icon="alert" className="size-8" />
                </div>

                <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">Page Not Found</h1>

                <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                    The track, playlist, or page you are looking for does not exist or may have been relocated.
                </p>

                <div className="mt-6 flex justify-center">
                    <Button href="/" variant="outline" size="md" className="gap-2">
                        <Icon icon="musicLibrary" className="size-4" />
                        <span>Return to Library</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
