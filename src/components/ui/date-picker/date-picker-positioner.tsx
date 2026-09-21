'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';
import { Portal } from '@ark-ui/react/portal';

import cn from '@/lib/utils/cn';

export type DatePickerPositionerProps = ArkDatePicker.PositionerProps;

export function DatePickerPositioner({ className, ...props }: DatePickerPositionerProps) {
    return (
        <Portal>
            <ArkDatePicker.Positioner className={cn('z-50', className)} {...props} />
        </Portal>
    );
}
