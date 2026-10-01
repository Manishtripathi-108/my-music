'use client';

import { Progress as ArkProgress } from '@ark-ui/react/progress';

import cn from '@/lib/cn';

export type ProgressCircleRangeProps = ArkProgress.CircleRangeProps;

export function ProgressCircleRange({ className, strokeLinecap = 'round', ...props }: ProgressCircleRangeProps) {
    return (
        <ArkProgress.CircleRange className={cn('stroke-primary transition-all duration-300', className)} strokeLinecap={strokeLinecap} {...props} />
    );
}
