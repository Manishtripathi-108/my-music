'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/utils/cn';

export type DatePickerContentProps = ArkDatePicker.ContentProps;

export function DatePickerContent({ className, ...props }: DatePickerContentProps) {
    return (
        <ArkDatePicker.Content
            className={cn(
                'bg-card text-card-foreground motion-scale-in-50 motion-translate-x-in-[21%] motion-translate-y-in-[-55%] motion-opacity-in-[50%] motion-blur-in-[10px] motion-duration-200 motion-ease-spring-smooth min-w-70 rounded-2xl border p-4 shadow-2xl outline-none',
                className
            )}
            {...props}
        />
    );
}
