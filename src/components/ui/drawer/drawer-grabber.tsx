'use client';

import { Drawer as ArkDrawer } from '@ark-ui/react/drawer';

import cn from '@/lib/cn';

export type DrawerGrabberProps = ArkDrawer.GrabberProps;

export function DrawerGrabber({ className, children, ...props }: DrawerGrabberProps) {
    return (
        <ArkDrawer.Grabber
            className={cn('group flex w-full cursor-grab items-center justify-center p-2 active:cursor-grabbing', className)}
            {...props}>
            {children ?? <ArkDrawer.GrabberIndicator className="bg-primary/50 group-hover:bg-primary h-1.5 w-12 rounded-full transition-colors" />}
        </ArkDrawer.Grabber>
    );
}
