'use client';

import { Drawer as ArkDrawer } from '@ark-ui/react/drawer';

import cn from '@/lib/cn';

export type DrawerTitleProps = ArkDrawer.TitleProps;

export function DrawerTitle({ className, ...props }: DrawerTitleProps) {
    return <ArkDrawer.Title className={cn('text-foreground text-xl font-bold tracking-tight', className)} {...props} />;
}
