'use client';

import { DateInput as ArkDateInput } from '@ark-ui/react/date-input';

import cn from '@/lib/utils/cn';

export type DateInputControlProps = ArkDateInput.ControlProps;

export function DateInputControl({ className, ...props }: DateInputControlProps) {
    return (
        <ArkDateInput.Control
            className={cn('ark-disabled:cursor-not-allowed ark-disabled:opacity-60 flex items-center gap-2', className)}
            {...props}
        />
    );
}
