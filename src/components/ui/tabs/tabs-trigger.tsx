'use client';

import { Tabs as ArkTabs } from '@ark-ui/react/tabs';

import cn from '@/lib/cn';

export type TabsTriggerProps = ArkTabs.TriggerProps;

export function TabsTrigger({ className, ...props }: TabsTriggerProps) {
    return (
        <ArkTabs.Trigger
            className={cn(
                'relative z-10 inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-1.5',
                'text-muted-foreground text-xs font-semibold tracking-wide transition-all duration-200 select-none',
                'hover:text-foreground',
                'focus-visible:ring-0 focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-40',
                'ark-selected:text-primary-foreground ark-selected:shadow-xs',
                className
            )}
            {...props}
        />
    );
}
