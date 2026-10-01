'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/cn';

export type DatePickerViewTriggerProps = ArkDatePicker.ViewTriggerProps;

export function DatePickerViewTrigger({ className, ...props }: DatePickerViewTriggerProps) {
    return (
        <ArkDatePicker.ViewTrigger
            className={cn('hover:bg-accent text-foreground cursor-pointer rounded-lg px-2 py-1 text-sm font-bold transition-colors', className)}
            {...props}
        />
    );
}
