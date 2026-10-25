'use client';

import { useEffect } from 'react';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

export interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('[Root Error Boundary]', error);
    }, [error]);

    return (
        <div className="bg-background relative flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <div className="from-danger/10 pointer-events-none absolute inset-x-0 -top-48 h-96 bg-linear-to-b to-transparent blur-3xl" />

            <div className="bg-card text-card-foreground motion-preset-slide-up-sm relative z-10 max-w-md rounded-3xl border p-8 shadow-sm">
                <div className="bg-danger/10 text-danger mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl">
                    <Icon icon="dangerCircle" className="size-8" />
                </div>

                <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">Something Went Wrong</h1>

                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    An unexpected application error occurred while processing your request.
                </p>

                {error.digest && <p className="text-muted-foreground mt-3 font-mono text-xs">Error ID: {error.digest}</p>}

                <div className="mt-6 flex justify-center gap-3">
                    <Button variant="outline" size="md" onClick={() => window.location.reload()} className="gap-2">
                        <Icon icon="refresh" className="size-4" />
                        <span>Reload Page</span>
                    </Button>
                    <Button variant="primary" size="md" onClick={() => reset()} className="gap-2">
                        <Icon icon="check" className="size-4" />
                        <span>Try Again</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
