'use client';

import { Tabs as ArkTabs } from '@ark-ui/react/tabs';

import cn from '@/lib/cn';

export interface TabsListProps extends ArkTabs.ListProps {
    variant?: 'pill' | 'underline';
}

export function TabsList({ variant = 'pill', className, ...props }: TabsListProps) {
    return (
        <ArkTabs.List
            className={cn(
                'bg-card inline-flex items-center gap-1 self-start rounded-2xl p-1 shadow-xs',
                variant === 'underline' && 'gap-4 rounded-none bg-transparent p-0 shadow-none',
                className
            )}
            {...props}
        />
    );
}
