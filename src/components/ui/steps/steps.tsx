'use client';

import React from 'react';

import { Steps as ArkSteps } from '@ark-ui/react/steps';

import cn from '@/lib/utils/cn';

export interface StepsProps extends ArkSteps.RootProps {
    children?: React.ReactNode;
}

export function Steps({ className, ...props }: StepsProps) {
    return <ArkSteps.Root className={cn('flex w-full ark-horizontal:flex-col ark-vertical:flex-row gap-6', className)} {...props} />;
}
