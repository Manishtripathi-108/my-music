'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/cn';

export type DatePickerTableHeaderProps = ArkDatePicker.TableHeaderProps;

export function DatePickerTableHeader({ className, ...props }: DatePickerTableHeaderProps) {
    return (
        <ArkDatePicker.TableHeader
            className={cn('text-muted-foreground py-1 text-center text-[11px] font-semibold tracking-wider uppercase', className)}
            {...props}
        />
    );
}
