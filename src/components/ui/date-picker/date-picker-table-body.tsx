'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/cn';

export type DatePickerTableBodyProps = ArkDatePicker.TableBodyProps;

export function DatePickerTableBody({ className, ...props }: DatePickerTableBodyProps) {
    return <ArkDatePicker.TableBody className={cn('flex flex-col', className)} {...props} />;
}
