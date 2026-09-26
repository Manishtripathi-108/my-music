'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/utils/cn';

export type DatePickerContentProps = ArkDatePicker.ContentProps;

export function DatePickerContent({ className, ...props }: DatePickerContentProps) {
    return (
        <ArkDatePicker.Content
            className={cn(
                'ark-open:motion-scale-in-95 ark-open:motion-opacity-in-0 ark-open:motion-translate-y-in-[-4px]',
                'ark-closed:motion-scale-out-95 ark-closed:motion-opacity-out-0 ark-closed:motion-translate-y-out-[-4px] ark-closed:motion-duration-150',
                'motion-duration-200 motion-ease-spring-smooth',
                'bg-card text-card-foreground min-w-70 rounded-2xl border p-4 shadow-2xl outline-none',
                className
            )}
            {...props}
        />
    );
}
