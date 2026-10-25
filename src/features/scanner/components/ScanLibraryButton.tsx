'use client';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useScanModalStore } from '../hooks/use-scan-modal-store';

export interface ScanLibraryButtonProps {
    className?: string;
}

export function ScanLibraryButton({ className }: ScanLibraryButtonProps) {
    const { openModal } = useScanModalStore();

    return (
        <Button variant="outline" size="sm" onClick={openModal} className={className ?? 'hidden gap-1.5 sm:inline-flex'}>
            <Icon icon="refresh" className="size-3.5" />
            <span>Scan Library</span>
        </Button>
    );
}

export default ScanLibraryButton;
