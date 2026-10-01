'use client';

import { Progress as ArkProgress } from '@ark-ui/react/progress';

import cn from '@/lib/cn';

export type ProgressValueTextProps = ArkProgress.ValueTextProps;

export function ProgressValueText({ className, ...props }: ProgressValueTextProps) {
    return <ArkProgress.ValueText className={cn('text-muted-foreground font-mono text-xs tabular-nums', className)} {...props} />;
}
