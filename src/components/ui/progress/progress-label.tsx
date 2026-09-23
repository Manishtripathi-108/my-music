'use client';

import { Progress as ArkProgress } from '@ark-ui/react/progress';

import cn from '@/lib/utils/cn';

export type ProgressLabelProps = ArkProgress.LabelProps;

export function ProgressLabel({ className, ...props }: ProgressLabelProps) {
    return <ArkProgress.Label className={cn('text-foreground text-xs font-semibold', className)} {...props} />;
}
