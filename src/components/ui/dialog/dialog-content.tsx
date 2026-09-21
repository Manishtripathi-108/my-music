'use client';

import { Dialog as ArkDialog } from '@ark-ui/react/dialog';

import cn from '@/lib/utils/cn';
import { Portal } from '@ark-ui/react/portal';

export type DialogContentProps = ArkDialog.ContentProps;

export function DialogContent({ className, ...props }: DialogContentProps) {
    return (
        <Portal>
            <ArkDialog.Backdrop className="ark-open:motion-preset-fade motion-duration-200 fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" />
            <ArkDialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <ArkDialog.Content
                    className={cn(
                        'bg-card text-card-foreground ark-open:motion-preset-pop motion-duration-250 motion-ease-spring-smooth relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl outline-none',
                        className
                    )}
                    {...props}
                />
            </ArkDialog.Positioner>
            ;
        </Portal>
    );
}
