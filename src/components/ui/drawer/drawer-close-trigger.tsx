'use client';

import { Drawer as ArkDrawer } from '@ark-ui/react/drawer';

import Icon from '@/components/ui/icon';
import cn from '@/lib/utils/cn';

export type DrawerCloseTriggerProps = ArkDrawer.CloseTriggerProps;

export function DrawerCloseTrigger({ className, children, ...props }: DrawerCloseTriggerProps) {
    return (
        <ArkDrawer.CloseTrigger
            className={cn(
                'text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none',
                className
            )}
            {...props}>
            {children ?? <Icon icon="close" className="size-4" />}
        </ArkDrawer.CloseTrigger>
    );
}
