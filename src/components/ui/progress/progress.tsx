'use client';

import { Progress as ArkProgress } from '@ark-ui/react/progress';

import cn from '@/lib/cn';

export type ProgressProps = ArkProgress.RootProps;

export function Progress({ className, ...props }: ProgressProps) {
    return <ArkProgress.Root className={cn('flex w-full flex-col gap-1.5', className)} {...props} />;
}
