import type { Metadata, Viewport } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';

import 'goey-toast/styles.css';

import '@/app/globals.css';
import ThemeScript from '@/components/providers/ThemeScript';
import ToastProvider from '@/components/providers/ToastProvider';
import { ThemeProvider } from '@/context/useTheme';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'My Music',
    description: 'Listen and stream your favorite music',
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#f2f3f5' },
        { media: '(prefers-color-scheme: dark)', color: '#090a0f' },
    ],
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            data-scroll-behavior="smooth"
            className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
            <head>
                <ThemeScript />
            </head>
            <body className="bg-background text-foreground flex min-h-screen flex-col font-sans antialiased transition-colors duration-300">
                <ThemeProvider>
                    {children}
                    <ToastProvider />
                </ThemeProvider>
            </body>
        </html>
    );
};

export default RootLayout;
