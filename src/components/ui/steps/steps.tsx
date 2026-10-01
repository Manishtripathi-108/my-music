'use client';

import React from 'react';

import { Steps as ArkSteps } from '@ark-ui/react/steps';

import cn from '@/lib/cn';

export interface StepsProps extends ArkSteps.RootProps {
    children?: React.ReactNode;
}

export function Steps({ className, ...props }: StepsProps) {
    return <ArkSteps.Root className={cn('ark-horizontal:flex-col ark-vertical:flex-row flex w-full gap-6', className)} {...props} />;
}
