'use client';

import { Steps as ArkSteps } from '@ark-ui/react/steps';

import cn from '@/lib/cn';

export type StepsSeparatorProps = ArkSteps.SeparatorProps;

export function StepsSeparator({ className, ...props }: StepsSeparatorProps) {
    return (
        <ArkSteps.Separator
            className={cn('bg-border ark-complete:bg-primary mx-2 h-0.5 flex-1 transition-colors duration-200', className)}
            {...props}
        />
    );
}
