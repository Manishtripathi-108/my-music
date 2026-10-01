'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/cn';

export type DatePickerViewProps = ArkDatePicker.ViewProps;

export function DatePickerView({ className, ...props }: DatePickerViewProps) {
    return <ArkDatePicker.View className={cn('flex flex-col gap-3', className)} {...props} />;
}
