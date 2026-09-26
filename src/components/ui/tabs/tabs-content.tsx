'use client';

import { Tabs as ArkTabs } from '@ark-ui/react/tabs';

import cn from '@/lib/utils/cn';

export type TabsContentProps = ArkTabs.ContentProps;

export function TabsContent({ className, ...props }: TabsContentProps) {
    return (
        <ArkTabs.Content
            className={cn(
                'ark-open:motion-opacity-in-0 ark-open:motion-translate-y-in-[4px] motion-duration-200 motion-ease-out',
                'focus-visible:ring-ring rounded-xl outline-none focus-visible:ring-2',
                className
            )}
            {...props}
        />
    );
}
