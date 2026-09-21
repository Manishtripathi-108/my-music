'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import Icon from '@/components/ui/icon';
import cn from '@/lib/utils/cn';

export type DatePickerNextTriggerProps = ArkDatePicker.NextTriggerProps;

export function DatePickerNextTrigger({ className, children, ...props }: DatePickerNextTriggerProps) {
    return (
        <ArkDatePicker.NextTrigger
            className={cn(
                'hover:bg-accent text-muted-foreground hover:text-foreground flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors',
                className
            )}
            {...props}>
            {children ?? <Icon icon="chevronRight" className="size-4" />}
        </ArkDatePicker.NextTrigger>
    );
}
