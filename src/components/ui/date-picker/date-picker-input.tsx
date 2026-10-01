'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/cn';

export type DatePickerInputProps = ArkDatePicker.InputProps;

export function DatePickerInput({ className, ...props }: DatePickerInputProps) {
    return (
        <ArkDatePicker.Input
            className={cn(
                'bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring ark-invalid:border-destructive ark-invalid:text-destructive ark-invalid:ring-destructive h-10 w-full rounded-xl border px-3.5 pr-10 text-sm transition-all focus-visible:border-transparent focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
                className
            )}
            {...props}
        />
    );
}
