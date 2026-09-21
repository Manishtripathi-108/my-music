'use client';

import { Drawer as ArkDrawer } from '@ark-ui/react/drawer';

import cn from '@/lib/utils/cn';

export type DrawerDescriptionProps = ArkDrawer.DescriptionProps;

export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
    return <ArkDrawer.Description className={cn('text-muted-foreground py-1 text-sm leading-relaxed', className)} {...props} />;
}
