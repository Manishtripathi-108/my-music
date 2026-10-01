'use client';

import { ScrollArea as ArkScrollArea } from '@ark-ui/react/scroll-area';

import cn from '@/lib/cn';

export type ScrollBarProps = ArkScrollArea.ScrollbarProps;

export function ScrollBar({ orientation = 'vertical', className, children, ...props }: ScrollBarProps) {
    return (
        <ArkScrollArea.Scrollbar
            orientation={orientation}
            className={cn(
                'hover:bg-muted/40 flex touch-none bg-transparent p-0.5 transition-colors duration-150 select-none',
                orientation === 'vertical' ? 'w-2.5' : 'h-2.5',
                className
            )}
            {...props}>
            {children ?? (
                <ArkScrollArea.Thumb className="bg-muted-foreground/30 hover:bg-muted-foreground/60 relative flex-1 rounded-full transition-colors before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-11 before:w-full before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
            )}
        </ArkScrollArea.Scrollbar>
    );
}
