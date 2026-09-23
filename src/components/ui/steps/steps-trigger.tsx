'use client';

import { Steps as ArkSteps } from '@ark-ui/react/steps';

import cn from '@/lib/utils/cn';

export type StepsTriggerProps = ArkSteps.TriggerProps;

export function StepsTrigger({ className, ...props }: StepsTriggerProps) {
    return (
        <ArkSteps.Trigger
            className={cn('flex cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left outline-none select-none', className)}
            {...props}
        />
    );
}
