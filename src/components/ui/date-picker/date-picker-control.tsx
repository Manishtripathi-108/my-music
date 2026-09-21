'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/utils/cn';

export type DatePickerControlProps = ArkDatePicker.ControlProps;

export function DatePickerControl({ className, ...props }: DatePickerControlProps) {
    return <ArkDatePicker.Control className={cn('flex items-center gap-2', className)} {...props} />;
}
