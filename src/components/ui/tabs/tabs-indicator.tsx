'use client';

import { Tabs as ArkTabs } from '@ark-ui/react/tabs';

import cn from '@/lib/cn';

export type TabsIndicatorProps = ArkTabs.IndicatorProps;

export function TabsIndicator({ className, ...props }: TabsIndicatorProps) {
    return (
        <ArkTabs.Indicator
            style={{
                transitionDuration: '200ms',
                transitionTimingFunction: 'ease-out',
            }}
            className={cn(
                'bg-primary rounded-xl',
                'pointer-events-none absolute z-0',
                'top-(--top) left-(--left) h-(--height) w-(--width)',
                'ease-in-out',
                className
            )}
            {...props}
        />
    );
}
