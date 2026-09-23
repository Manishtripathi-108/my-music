'use client';

import { DateInput as ArkDateInput } from '@ark-ui/react/date-input';

import cn from '@/lib/utils/cn';

export type DateInputLabelProps = ArkDateInput.LabelProps;

export function DateInputLabel({ className, ...props }: DateInputLabelProps) {
    return (
        <ArkDateInput.Label
            className={cn('text-foreground ark-invalid:text-destructive ark-disabled:text-muted-foreground text-xs font-semibold tracking-wide', className)}
            {...props}
        />
    );
}
