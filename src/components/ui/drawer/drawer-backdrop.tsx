'use client';

import { Drawer as ArkDrawer } from '@ark-ui/react/drawer';

import cn from '@/lib/utils/cn';

export type DrawerBackdropProps = ArkDrawer.BackdropProps;

export function DrawerBackdrop({ className, ...props }: DrawerBackdropProps) {
    return (
        <ArkDrawer.Backdrop
            className={cn(
                'ark-open:motion-preset-fade ark-closed:motion-opacity-out-0 motion-duration-250 fixed inset-0 z-50 bg-black/60 backdrop-blur-xs',
                className
            )}
            {...props}
        />
    );
}
