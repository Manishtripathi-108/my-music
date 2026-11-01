'use client';

import { NumberInput as ArkNumberInput } from '@ark-ui/react/number-input';

import cn from '@/lib/cn';

export type NumberInputInputProps = ArkNumberInput.InputProps;

export function NumberInputInput({ className, ...props }: NumberInputInputProps) {
    return (
        <ArkNumberInput.Input
            className={cn(
                'bg-input text-foreground placeholder:text-muted-foreground focus:ring-ring h-10 w-full rounded-xl px-3.5 pr-10 font-mono text-sm font-medium tabular-nums inset-shadow-xs transition-all outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
}

export default NumberInputInput;
