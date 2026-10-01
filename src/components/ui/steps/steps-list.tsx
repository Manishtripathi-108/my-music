'use client';

import { Steps as ArkSteps } from '@ark-ui/react/steps';

import cn from '@/lib/cn';

export type StepsListProps = ArkSteps.ListProps;

export function StepsList({ className, ...props }: StepsListProps) {
    return (
        <ArkSteps.List
            className={cn('ark-vertical:flex-col ark-vertical:items-start flex w-full items-center justify-between gap-2', className)}
            {...props}
        />
    );
}
