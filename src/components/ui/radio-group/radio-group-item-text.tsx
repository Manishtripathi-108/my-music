'use client';

import { RadioGroup as ArkRadioGroup } from '@ark-ui/react/radio-group';

import cn from '@/lib/utils/cn';

export type RadioGroupItemTextProps = ArkRadioGroup.ItemTextProps;

export function RadioGroupItemText({ className, ...props }: RadioGroupItemTextProps) {
    return (
        <ArkRadioGroup.ItemText
            className={cn('text-foreground ark-group-disabled:text-muted-foreground text-xs font-semibold', className)}
            {...props}
        />
    );
}
