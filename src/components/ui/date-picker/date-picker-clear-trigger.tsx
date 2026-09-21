'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/utils/cn';

export type DatePickerClearTriggerProps = ArkDatePicker.ClearTriggerProps;

export function DatePickerClearTrigger({ className, children, ...props }: DatePickerClearTriggerProps) {
    return (
        <ArkDatePicker.ClearTrigger
            className={cn(
                'bg-card text-muted-foreground hover:bg-accent hover:text-foreground motion-preset-slide-left motion-duration-200 h-10 cursor-pointer rounded-xl border px-3 text-xs font-medium transition-colors',
                className
            )}
            {...props}>
            {children ?? 'Clear'}
        </ArkDatePicker.ClearTrigger>
    );
}
