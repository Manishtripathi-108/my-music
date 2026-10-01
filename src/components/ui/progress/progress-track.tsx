'use client';

import { Progress as ArkProgress } from '@ark-ui/react/progress';

import cn from '@/lib/cn';

export type ProgressTrackProps = ArkProgress.TrackProps;

export function ProgressTrack({ className, ...props }: ProgressTrackProps) {
    return <ArkProgress.Track className={cn('bg-muted h-2 w-full overflow-hidden rounded-full', className)} {...props} />;
}
