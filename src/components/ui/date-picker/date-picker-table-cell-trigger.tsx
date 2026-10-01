'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import cn from '@/lib/cn';

export type DatePickerTableCellTriggerProps = ArkDatePicker.TableCellTriggerProps;

export function DatePickerTableCellTrigger({ className, ...props }: DatePickerTableCellTriggerProps) {
    return (
        <ArkDatePicker.TableCellTrigger
            className={cn(
                'flex size-8 w-full cursor-pointer items-center justify-center rounded-lg',
                'text-foreground text-xs font-medium transition-all',

                'hover:bg-accent',

                'ark-selected:bg-primary ark-selected:text-primary-foreground',

                'ark-today:border ark-today:border-primary',

                '[&[data-in-range]:not([data-range-start]):not([data-range-end])]:rounded-none',
                '[&[data-in-range]:not([data-range-start]):not([data-range-end])]:bg-accent',
                '[&[data-in-range]:not([data-range-start]):not([data-range-end])]:text-accent-foreground',

                'ark-range-start:rounded-l-lg ark-range-start:rounded-r-none',
                'ark-range-start:bg-primary ark-range-start:text-primary-foreground',

                'ark-range-end:rounded-r-lg ark-range-end:rounded-l-none',
                'ark-range-end:bg-primary ark-range-end:text-primary-foreground',

                'ark-disabled:cursor-not-allowed ark-disabled:opacity-30',

                'ark-unavailable:cursor-not-allowed',
                'ark-unavailable:line-through ark-unavailable:text-muted-foreground',

                className
            )}
            {...props}
        />
    );
}
