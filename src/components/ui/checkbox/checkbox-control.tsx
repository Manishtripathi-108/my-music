'use client';

import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox';

import cn from '@/lib/cn';

import { CheckboxIndicator } from './checkbox-indicator';

export interface CheckboxControlProps extends ArkCheckbox.ControlProps {
    children?: React.ReactNode;
}

export function CheckboxControl({ className, children, ...props }: CheckboxControlProps) {
    return (
        <ArkCheckbox.Control
            className={cn(
                'bg-card flex size-4.5 shrink-0 items-center justify-center rounded-md inset-shadow-xs transition-all outline-none',
                'group-ark-checked:bg-primary group-ark-checked:text-primary-foreground group-ark-checked:shadow-xs',
                'group-ark-indeterminate:bg-primary group-ark-indeterminate:text-primary-foreground group-ark-indeterminate:shadow-xs',
                'group-focus-visible:ring-ring group-focus-visible:ring-offset-background group-focus-visible:ring-2 group-focus-visible:ring-offset-2',
                'group-disabled:cursor-not-allowed group-disabled:opacity-50',
                className
            )}
            {...props}>
            {children ?? <CheckboxIndicator />}
        </ArkCheckbox.Control>
    );
}

export default CheckboxControl;
