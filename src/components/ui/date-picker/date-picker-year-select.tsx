'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/utils/cn';

export type DatePickerYearSelectProps = ArkDatePicker.YearSelectProps;

export function DatePickerYearSelect({ className, ...props }: DatePickerYearSelectProps) {
    return <ArkDatePicker.YearSelect className={cn('bg-card text-foreground rounded-lg border p-1 text-xs', className)} {...props} />;
}
