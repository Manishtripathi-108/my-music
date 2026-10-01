import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';

import 'goey-toast/styles.css';

import '@/app/globals.css';
import ThemeScript from '@/components/providers/ThemeScript';
import ToastProvider from '@/components/providers/ToastProvider';

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
                {children}
                <ToastProvider />
            </body>
        </html>
    );
};

export default RootLayout;
