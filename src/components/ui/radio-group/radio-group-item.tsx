'use client';

import { RadioGroup as ArkRadioGroup } from '@ark-ui/react/radio-group';

import cn from '@/lib/cn';

/** Props for individual radio group item components */
export interface RadioGroupItemProps extends ArkRadioGroup.ItemProps {
    cardStyle?: boolean;
}

/**
 * Individual radio item component with physical compression feedback and checked indicators.
 */
export function RadioGroupItem({ cardStyle = false, className, children, ...props }: RadioGroupItemProps) {
    return (
        <ArkRadioGroup.Item
            className={cn(
                'group flex cursor-pointer items-center gap-3 rounded-xl transition-all outline-none select-none disabled:cursor-not-allowed disabled:opacity-50',
                cardStyle
                    ? 'bg-card text-card-foreground ark-checked:bg-primary/5 ark-checked:ring-1 ark-checked:ring-primary/40 rounded-xl p-3.5 shadow-sm transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-md hover:brightness-[1.02] active:scale-[0.99] active:shadow-inner active:inset-shadow-xs'
                    : 'py-1',
                className
            )}
            {...props}>
            <ArkRadioGroup.ItemHiddenInput />
            {children}
        </ArkRadioGroup.Item>
    );
}
