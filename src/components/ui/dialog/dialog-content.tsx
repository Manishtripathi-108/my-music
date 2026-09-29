'use client';

import { Dialog as ArkDialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';

import cn from '@/lib/utils/cn';

export type DialogContentProps = ArkDialog.ContentProps;

export function DialogContent({ className, ...props }: DialogContentProps) {
    return (
        <Portal>
            <ArkDialog.Backdrop className="ark-open:motion-opacity-in-0 ark-closed:motion-opacity-out-0 motion-duration-200 bg-background/60 fixed inset-0 z-50 backdrop-blur-xs" />
            <ArkDialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <ArkDialog.Content
                    className={cn(
                        'ark-open:motion-scale-in-95 ark-open:motion-opacity-in-0 ark-open:motion-translate-y-in-[6px]',
                        'ark-closed:motion-scale-out-95 ark-closed:motion-opacity-out-0 ark-closed:motion-translate-y-out-[6px] ark-closed:motion-duration-150',
                        'motion-duration-200 motion-ease-spring-smooth',
                        'bg-card text-card-foreground relative rounded-2xl border p-6 shadow-2xl outline-none',
                        'max-h-[96svh] w-full max-w-lg scrollbar-thin overflow-y-auto',
                        className
                    )}
                    {...props}
                />
            </ArkDialog.Positioner>
        </Portal>
    );
}
