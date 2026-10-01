'use client';

import { Dialog as ArkDialog } from '@ark-ui/react/dialog';

import cn from '@/lib/cn';

export type DialogDescriptionProps = ArkDialog.DescriptionProps;

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
    return <ArkDialog.Description className={cn('text-muted-foreground mt-2 text-sm leading-relaxed', className)} {...props} />;
}
