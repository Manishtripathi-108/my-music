'use client';

import { useEffect } from 'react';

export interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error('[Fatal Application Error]', error);
    }, [error]);

    return (
        <html lang="en">
            <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#09090b', color: '#f4f4f5' }}>
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem',
                        textAlign: 'center',
                    }}>
                    <div
                        style={{
                            maxWidth: '28rem',
                            borderRadius: '1.5rem',
                            border: '1px solid #27272a',
                            backgroundColor: '#18181b',
                            padding: '2rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Application Error</h1>
                        <p style={{ color: '#a1a1aa', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                            A critical system error occurred. Please try reloading the application.
                        </p>
                        {error.digest && (
                            <p style={{ color: '#71717a', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '0.75rem' }}>
                                Reference: {error.digest}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => reset()}
                            style={{
                                marginTop: '1.5rem',
                                padding: '0.625rem 1.25rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                borderRadius: '0.75rem',
                                border: 'none',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                cursor: 'pointer',
                            }}>
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
