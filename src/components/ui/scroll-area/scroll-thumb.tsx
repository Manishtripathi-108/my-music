'use client';

import { ScrollArea as ArkScrollArea } from '@ark-ui/react/scroll-area';

import cn from '@/lib/cn';

export type ScrollThumbProps = ArkScrollArea.ThumbProps;

export function ScrollThumb({ className, ...props }: ScrollThumbProps) {
    return (
        <ArkScrollArea.Thumb
            className={cn(
                "bg-muted-foreground/30 hover:bg-muted-foreground/60 relative flex-1 rounded-full transition-colors before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-11 before:w-full before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
                className
            )}
            {...props}
        />
    );
}
