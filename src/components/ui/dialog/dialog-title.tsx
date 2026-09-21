'use client';

import { Dialog as ArkDialog } from '@ark-ui/react/dialog';

import cn from '@/lib/utils/cn';

export type DialogTitleProps = ArkDialog.TitleProps;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
    return <ArkDialog.Title className={cn('text-foreground text-xl font-bold tracking-tight', className)} {...props} />;
}
