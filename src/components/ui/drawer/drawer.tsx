'use client';

import { Drawer as ArkDrawer } from '@ark-ui/react/drawer';

export interface DrawerProps extends Omit<ArkDrawer.RootProps, 'swipeDirection'> {
    swipeDirection?: 'right' | 'left' | 'bottom' | 'top';
}

const sideToSwipeDirection = {
    right: 'end',
    left: 'start',
    bottom: 'down',
    top: 'up',
} as const;

export function Drawer({ swipeDirection, ...props }: DrawerProps) {
    const resolvedSwipeDirection = swipeDirection ? sideToSwipeDirection[swipeDirection] : 'down';
    return <ArkDrawer.Root swipeDirection={resolvedSwipeDirection} {...props} />;
}
