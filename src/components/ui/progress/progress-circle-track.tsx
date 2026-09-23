'use client';

import { Progress as ArkProgress } from '@ark-ui/react/progress';

import cn from '@/lib/utils/cn';

export type ProgressCircleTrackProps = ArkProgress.CircleTrackProps;

export function ProgressCircleTrack({ className, ...props }: ProgressCircleTrackProps) {
    return <ArkProgress.CircleTrack className={cn('stroke-border', className)} {...props} />;
}
