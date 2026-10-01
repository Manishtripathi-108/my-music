'use client';

import { DatePicker, DatePickerCalendar, DatePickerContent, type DatePickerProps } from '@/components/ui/date-picker';
import cn from '@/lib/cn';

export interface CalendarProps extends Omit<DatePickerProps, 'inline'> {
    className?: string;
}

export function Calendar({ className, ...props }: CalendarProps) {
    return (
        <DatePicker inline className={cn('w-fit', className)} {...props}>
            <DatePickerContent className="bg-card text-card-foreground rounded-2xl border p-4 shadow-xs">
                <DatePickerCalendar />
            </DatePickerContent>
        </DatePicker>
    );
}
