'use client';

import React from 'react';

import { Tabs as ArkTabs } from '@ark-ui/react/tabs';

import cn from '@/lib/cn';

export interface TabsProps extends ArkTabs.RootProps {
    children?: React.ReactNode;
}

export function Tabs({ className, ...props }: TabsProps) {
    return <ArkTabs.Root className={cn('flex w-full flex-col gap-4', className)} {...props} />;
}
