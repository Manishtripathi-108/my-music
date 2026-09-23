'use client';

import { Field as ArkField } from '@ark-ui/react/field';

import cn from '@/lib/utils/cn';

export type FieldInputProps = ArkField.InputProps;

export function FieldInput({ className, ...props }: FieldInputProps) {
    return (
        <ArkField.Input
            className={cn(
                'bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring',
                'ark-invalid:border-destructive ark-invalid:focus-visible:ring-destructive',
                'h-10 w-full rounded-xl border px-3.5 text-sm transition-all',
                'focus-visible:border-transparent focus-visible:ring-2 focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
}
