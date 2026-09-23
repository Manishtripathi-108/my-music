'use client';

import { Tabs as ArkTabs } from '@ark-ui/react/tabs';

import cn from '@/lib/utils/cn';

export type TabsContentProps = ArkTabs.ContentProps;

export function TabsContent({ className, ...props }: TabsContentProps) {
    return (
        <ArkTabs.Content
            className={cn(
                'ark-open:motion-preset-blur-right motion-duration-200 focus-visible:ring-ring rounded-xl outline-none focus-visible:ring-2',
                className
            )}
            {...props}
        />
    );
}
