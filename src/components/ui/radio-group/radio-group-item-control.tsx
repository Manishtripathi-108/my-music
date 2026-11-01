'use client';

import { RadioGroup as ArkRadioGroup } from '@ark-ui/react/radio-group';

import cn from '@/lib/cn';

export type RadioGroupItemControlProps = ArkRadioGroup.ItemControlProps;

export function RadioGroupItemControl({ className, children, ...props }: RadioGroupItemControlProps) {
    return (
        <ArkRadioGroup.ItemControl
            className={cn(
                'bg-card group-ark-checked:bg-primary group-ark-checked:text-primary-foreground group-ark-checked:shadow-xs group-focus-visible:ring-ring mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full inset-shadow-xs transition-all outline-none group-focus-visible:ring-2',
                className
            )}
            {...props}>
            {children ?? <div className="bg-primary-foreground group-ark-checked:opacity-100 size-1.5 rounded-full opacity-0 transition-opacity" />}
        </ArkRadioGroup.ItemControl>
    );
}
