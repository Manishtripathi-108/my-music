'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/cn';

export type DatePickerInputProps = ArkDatePicker.InputProps;

export function DatePickerInput({ className, ...props }: DatePickerInputProps) {
    return (
        <ArkDatePicker.Input
            className={cn(
                'bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring ark-invalid:text-destructive ark-invalid:ring-destructive h-10 w-full rounded-xl px-3.5 pr-10 font-mono text-sm inset-shadow-xs transition-all outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
                className
            )}
            {...props}
        />
    );
}
