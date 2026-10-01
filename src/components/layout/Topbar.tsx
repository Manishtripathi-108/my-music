'use client';

import React from 'react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import ThemeToggler from '@/components/ui/ThemeToggler';
import { useScanModalStore } from '@/features/scanner';
import cn from '@/lib/cn';

export interface TopbarProps extends React.ComponentProps<'header'> {
    /** Brand title displayed next to logo. Defaults to "My Music" */
    title?: string;
    /** Subtitle text displayed below title on larger screens */
    subtitle?: string;
    /** Text for the status/version badge. Defaults to "LIBRARY SCANNER" */
    badgeText?: string;
    /** Custom actions slot rendered on the right side */
    actions?: React.ReactNode;
    /** Whether to stick to the top with a glassmorphism backdrop blur. Defaults to true */
    sticky?: boolean;
}

export function Topbar({
    title = 'My Music',
    subtitle = 'High-Fidelity Audio Library Engine',
    badgeText = 'LIBRARY SCANNER',
    actions,
    sticky = true,
    className,
    children,
    ...props
}: TopbarProps) {
    const { openModal: openScanModal } = useScanModalStore();

    return (
        <header
            role="banner"
            className={cn(
                'w-full border-b transition-colors duration-200',
                sticky && 'bg-background/80 sticky top-0 z-40 backdrop-blur-md',
                className
            )}
            {...props}>
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand / Logo */}
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform hover:scale-105">
                        <Icon icon="audio" className="size-5.5" />
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground text-base font-bold tracking-tight sm:text-lg">{title}</span>
                            {badgeText && (
                                <Badge variant="primary" size="xs" className="hidden sm:inline-flex">
                                    {badgeText}
                                </Badge>
                            )}
                        </div>
                        {subtitle && <p className="text-muted-foreground hidden text-[11px] leading-tight sm:block">{subtitle}</p>}
                    </div>
                </div>

                {/* Center Children (e.g. Navigation or Search slot) */}
                {children && <div className="hidden items-center gap-2 md:flex">{children}</div>}

                {/* Right Controls & Actions */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <Button variant="outline" size="sm" onClick={openScanModal} className="hidden gap-1.5 sm:inline-flex">
                        <Icon icon="refresh" className="size-3.5" />
                        <span>Scan Library</span>
                    </Button>

                    {actions}

                    {/* Theme Toggler */}
                    <ThemeToggler />
                </div>
            </div>
        </header>
    );
}

export default Topbar;
