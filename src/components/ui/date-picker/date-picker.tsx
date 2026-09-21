'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/utils/cn';

export type DatePickerProps = ArkDatePicker.RootProps;

export function DatePicker({ className, locale = 'en-IN', ...props }: DatePickerProps) {
    return <ArkDatePicker.Root className={cn('flex w-full max-w-xs flex-col gap-1.5', className)} locale={locale} {...props} />;
}
