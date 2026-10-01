'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/cn';

export type DatePickerTableProps = ArkDatePicker.TableProps;

export function DatePickerTable({ className, ...props }: DatePickerTableProps) {
    return <ArkDatePicker.Table className={cn('w-full border-collapse', className)} {...props} />;
}
