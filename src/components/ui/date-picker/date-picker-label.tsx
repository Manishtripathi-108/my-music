'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/cn';

export type DatePickerLabelProps = ArkDatePicker.LabelProps;

export function DatePickerLabel({ className, ...props }: DatePickerLabelProps) {
    return (
        <ArkDatePicker.Label
            className={cn(
                'text-foreground ark-disabled:text-muted-foreground ark-invalid:text-destructive text-xs font-semibold tracking-wide',
                className
            )}
            {...props}
        />
    );
}
