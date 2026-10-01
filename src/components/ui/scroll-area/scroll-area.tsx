'use client';

import { ScrollArea as ArkScrollArea } from '@ark-ui/react/scroll-area';

import cn from '@/lib/cn';

export type ScrollAreaProps = ArkScrollArea.RootProps;

export function ScrollArea({ className, ...props }: ScrollAreaProps) {
    return <ArkScrollArea.Root className={cn('bg-card relative w-full overflow-hidden rounded-2xl border', className)} {...props} />;
}
