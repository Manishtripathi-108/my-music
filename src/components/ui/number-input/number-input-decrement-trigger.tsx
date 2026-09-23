'use client';

import { NumberInput as ArkNumberInput } from '@ark-ui/react/number-input';

import Icon from '@/components/ui/icon';
import cn from '@/lib/utils/cn';

export type NumberInputDecrementTriggerProps = ArkNumberInput.DecrementTriggerProps;

export function NumberInputDecrementTrigger({ className, children, ...props }: NumberInputDecrementTriggerProps) {
    return (
        <ArkNumberInput.DecrementTrigger
            aria-label="Decrement"
            className={cn(
                'text-muted-foreground not-disabled:hover:bg-accent not-disabled:hover:text-foreground flex h-4 w-5 cursor-pointer items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                className
            )}
            {...props}>
            {children ?? <Icon icon="chevronDown" className="size-3" />}
        </ArkNumberInput.DecrementTrigger>
    );
}
