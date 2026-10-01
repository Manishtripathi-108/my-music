'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/cn';

export type DatePickerTableCellProps = ArkDatePicker.TableCellProps;

export function DatePickerTableCell({ className, ...props }: DatePickerTableCellProps) {
    return <ArkDatePicker.TableCell className={cn('p-0', className)} {...props} />;
}
