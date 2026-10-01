'use client';

import { NumberInput as ArkNumberInput } from '@ark-ui/react/number-input';

import cn from '@/lib/cn';

export type NumberInputInputProps = ArkNumberInput.InputProps;

export function NumberInputInput({ className, ...props }: NumberInputInputProps) {
    return (
        <ArkNumberInput.Input
            className={cn(
                'bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-xl border px-3.5 pr-10 text-sm font-medium tabular-nums transition-all focus-visible:border-transparent focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
}
