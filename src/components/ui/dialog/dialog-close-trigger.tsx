'use client';

import { Dialog as ArkDialog } from '@ark-ui/react/dialog';

import Icon from '@/components/ui/Icon';
import cn from '@/lib/cn';

export type DialogCloseTriggerProps = ArkDialog.CloseTriggerProps;

export function DialogCloseTrigger({ className, children, ...props }: DialogCloseTriggerProps) {
    return (
        <ArkDialog.CloseTrigger
            aria-label="Close dialog"
            className={cn(
                'text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring absolute top-4 right-4 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none',
                className
            )}
            {...props}>
            {children ?? <Icon icon="close" className="size-4" />}
        </ArkDialog.CloseTrigger>
    );
}
