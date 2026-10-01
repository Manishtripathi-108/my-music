'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import Icon from '@/components/ui/Icon';
import cn from '@/lib/cn';

export type DatePickerTriggerProps = ArkDatePicker.TriggerProps;

export function DatePickerTrigger({ className, children, ...props }: DatePickerTriggerProps) {
    return (
        <ArkDatePicker.Trigger
            className={cn(
                'bg-card text-muted-foreground hover:bg-accent hover:text-foreground h-10 cursor-pointer rounded-xl border px-3 text-xs font-medium transition-colors',
                className
            )}
            {...props}>
            {children ?? <Icon icon="calendar" className="size-4" />}
        </ArkDatePicker.Trigger>
    );
}
