'use client';

import React from 'react';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import cn from '@/lib/cn';

import { useScanModalStore } from '../hooks/use-scan-modal-store';

/** Props for configuring the ScanLibraryButton component */
export interface ScanLibraryButtonProps {
    className?: string;
    variant?: 'primary' | 'dark' | 'slate' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'link';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    children?: React.ReactNode;
}

/**
 * Interactive button component triggering the modal library scanner dialog.
 */
export function ScanLibraryButton({ className, variant = 'primary', size = 'md', children }: ScanLibraryButtonProps) {
    const { openModal } = useScanModalStore();

    return (
        <Button
            variant={variant}
            size={size}
            onClick={openModal}
            className={cn('gap-2.5 font-mono shadow-sm hover:shadow active:shadow-inner', className)}>
            <Icon icon="refresh" className={size === 'xl' || size === 'lg' ? 'size-5' : 'size-3.5'} />
            {children ?? <span>Scan Library</span>}
        </Button>
    );
}

export default ScanLibraryButton;
