'use client';

import { RadioGroup as ArkRadioGroup } from '@ark-ui/react/radio-group';

import cn from '@/lib/cn';

export interface RadioGroupItemProps extends ArkRadioGroup.ItemProps {
    cardStyle?: boolean;
}

export function RadioGroupItem({ cardStyle = false, className, children, ...props }: RadioGroupItemProps) {
    return (
        <ArkRadioGroup.Item
            className={cn(
                'group flex cursor-pointer items-center gap-3 rounded-xl transition-all select-none disabled:cursor-not-allowed disabled:opacity-50',
                cardStyle
                    ? 'bg-card hover:border-primary/40 ark-checked:border-primary ark-checked:bg-primary/5 ark-checked:ring-primary ark-checked:ring-1 border p-3.5'
                    : 'py-1',
                className
            )}
            {...props}>
            <ArkRadioGroup.ItemHiddenInput />
            {children}
        </ArkRadioGroup.Item>
    );
}
