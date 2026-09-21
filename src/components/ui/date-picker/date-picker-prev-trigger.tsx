'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import Icon from '@/components/ui/icon';
import cn from '@/lib/utils/cn';

export type DatePickerPrevTriggerProps = ArkDatePicker.PrevTriggerProps;

export function DatePickerPrevTrigger({ className, children, ...props }: DatePickerPrevTriggerProps) {
    return (
        <ArkDatePicker.PrevTrigger
            className={cn(
                'hover:bg-accent text-muted-foreground hover:text-foreground flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors',
                className
            )}
            {...props}>
            {children ?? <Icon icon="chevronLeft" className="size-4" />}
        </ArkDatePicker.PrevTrigger>
    );
}
