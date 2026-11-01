'use client';

import React from 'react';

import Button from '@/components/ui/Button';
import ColorSchemeSelector from '@/components/ui/ColorSchemeSelector';
import Icon from '@/components/ui/Icon';
import Link from '@/components/ui/Link';
import ThemeToggler from '@/components/ui/ThemeToggler';
import { useScanModalStore } from '@/features/scanner';
import cn from '@/lib/cn';

export interface TopbarProps extends React.ComponentProps<'header'> {
    /** Brand title displayed on the left. Defaults to "MyMusic.fm" */
    title?: string;
    /** Subtitle or version tag. Defaults to "v2.4" */
    subtitle?: string;
    /** Custom actions slot rendered on the right side */
    actions?: React.ReactNode;
    /** Extra class names */
    className?: string;
}

/**
 * Application top navigation bar featuring brand identity, component showcase link,
 * scan modal trigger, and theme toggle.
 */
export function Topbar({ title = 'MyMusic.fm', subtitle = 'v2.4', actions, className, ...props }: TopbarProps) {
    const { openModal } = useScanModalStore();

    return (
        <header
            role="banner"
            className={cn(
                'bg-card/90 sticky top-4 z-40 mx-auto flex w-full max-w-5xl items-center justify-between rounded-full px-3.5 py-2 font-mono shadow-md backdrop-blur-md transition-all duration-200 select-none sm:top-5 sm:px-6 sm:py-2.5',
                className
            )}
            {...props}>
            {/* Left Brand Identity */}
            <div className="flex items-center gap-3">
                <Link href="/" variant="subtle" className="group flex items-center gap-2.5 rounded-full hover:no-underline">
                    <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full shadow-2xs transition-transform group-hover:scale-105">
                        <Icon icon="audio" className="size-4" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-bold tracking-tight group-hover:opacity-90 sm:text-base">{title}</span>
                        {subtitle && (
                            <span className="bg-muted text-muted-foreground hidden rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline-block">
                                {subtitle}
                            </span>
                        )}
                    </div>
                </Link>
            </div>

            {/* Right: Component Navigation, Scan Modal Trigger, and Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Component Route Navigation */}
                <Link href="/component" variant="nav" size="xs" className="gap-1.5">
                    <Icon icon="sparkle" className="text-primary size-3.5" />
                    <span>Components ↗</span>
                </Link>

                {/* Scan Library Modal Trigger */}
                <Button
                    variant="primary"
                    size="sm"
                    onClick={openModal}
                    className="gap-1.5 rounded-full px-3.5 text-xs font-medium shadow-sm hover:shadow sm:px-4">
                    <Icon icon="refresh" className="size-3.5" />
                    <span>Scan Library</span>
                </Button>

                {actions}

                {/* Theme & Palette Controls in a subtle pill */}
                <div className="border-muted-foreground/15 flex items-center border-l pl-1 sm:pl-1.5">
                    <div className="bg-muted/40 flex items-center gap-1 rounded-full p-1 shadow-2xs">
                        <ColorSchemeSelector />
                        <div className="bg-muted-foreground/20 h-4 w-px" />
                        <ThemeToggler />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Topbar;
