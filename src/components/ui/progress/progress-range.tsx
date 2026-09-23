'use client';

import { Progress as ArkProgress } from '@ark-ui/react/progress';

import cn from '@/lib/utils/cn';

export type ProgressRangeProps = ArkProgress.RangeProps;

export function ProgressRange({ className, ...props }: ProgressRangeProps) {
    return (
        <ArkProgress.Range
            className={cn(
                'bg-primary ark-indeterminate:animate-slide-across ark-indeterminate:w-1/2 ark-indeterminate:motion-ease-in-quart h-full rounded-full transition-all duration-300',
                className
            )}
            {...props}
        />
    );
}
