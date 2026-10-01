'use client';

import { NumberInput as ArkNumberInput } from '@ark-ui/react/number-input';

import Icon from '@/components/ui/Icon';
import cn from '@/lib/cn';

export type NumberInputIncrementTriggerProps = ArkNumberInput.IncrementTriggerProps;

export function NumberInputIncrementTrigger({ className, children, ...props }: NumberInputIncrementTriggerProps) {
    return (
        <ArkNumberInput.IncrementTrigger
            aria-label="Increment"
            className={cn(
                'text-muted-foreground not-disabled:hover:bg-accent not-disabled:hover:text-foreground flex h-4 w-5 cursor-pointer items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                className
            )}
            {...props}>
            {children ?? <Icon icon="chevronUp" className="size-3" />}
        </ArkNumberInput.IncrementTrigger>
    );
}
