'use client';

import { Drawer as ArkDrawer } from '@ark-ui/react/drawer';

import cn from '@/lib/cn';

export type DrawerPositionerProps = ArkDrawer.PositionerProps;

export function DrawerPositioner({ className, ...props }: DrawerPositionerProps) {
    return (
        <ArkDrawer.Positioner
            className={cn(
                'ark-swipe-down:items-end ark-swipe-right:justify-end ark-swipe-left:justify-start ark-swipe-up:items-start pointer-events-none fixed inset-0 z-50 flex',
                className
            )}
            {...props}
        />
    );
}
