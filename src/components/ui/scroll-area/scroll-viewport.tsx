'use client';

import { ScrollArea as ArkScrollArea } from '@ark-ui/react/scroll-area';

import cn from '@/lib/utils/cn';

export type ScrollViewportProps = ArkScrollArea.ViewportProps;

export function ScrollViewport({ className, ...props }: ScrollViewportProps) {
    return (
        <ArkScrollArea.Viewport
            className={cn('h-full w-full overflow-y-auto p-4 scrollbar-none [&::-webkit-scrollbar]:hidden', className)}
            {...props}
        />
    );
}
