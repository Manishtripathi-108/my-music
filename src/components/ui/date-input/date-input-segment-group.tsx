'use client';

import { DateInput as ArkDateInput } from '@ark-ui/react/date-input';

import cn from '@/lib/utils/cn';

export type DateInputSegmentGroupProps = ArkDateInput.SegmentGroupProps;

export function DateInputSegmentGroup({ className, ...props }: DateInputSegmentGroupProps) {
    return (
        <ArkDateInput.SegmentGroup
            className={cn(
                'bg-card text-foreground ark-invalid:border-destructive focus-within:ring-ring ark-invalid:ring-destructive flex h-10 w-full items-center rounded-xl border px-3 text-sm font-medium transition-all focus-within:border-transparent focus-within:ring-2 focus-within:outline-none',
                className
            )}
            {...props}>
            <ArkDateInput.SegmentContext>
                {(segment) => (
                    <ArkDateInput.Segment
                        segment={segment}
                        className="focus:bg-primary focus:text-primary-foreground text-foreground focus:ark-placeholder-shown:text-primary-foreground ark-group-invalid:text-destructive ark-placeholder-shown:text-muted-foreground inline-flex items-center justify-center rounded px-1 text-center font-mono tabular-nums outline-none select-none"
                    />
                )}
            </ArkDateInput.SegmentContext>
            <ArkDateInput.HiddenInput />
        </ArkDateInput.SegmentGroup>
    );
}
