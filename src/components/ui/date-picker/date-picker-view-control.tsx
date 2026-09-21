'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/utils/cn';

export type DatePickerViewControlProps = ArkDatePicker.ViewControlProps;

export function DatePickerViewControl({ className, ...props }: DatePickerViewControlProps) {
    return <ArkDatePicker.ViewControl className={cn('flex items-center justify-between gap-2', className)} {...props} />;
}
