'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/utils/cn';

export type DatePickerMonthSelectProps = ArkDatePicker.MonthSelectProps;

export function DatePickerMonthSelect({ className, ...props }: DatePickerMonthSelectProps) {
    return <ArkDatePicker.MonthSelect className={cn('bg-card text-foreground rounded-lg border p-1 text-xs', className)} {...props} />;
}
