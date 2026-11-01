'use client';

import { Field as ArkField } from '@ark-ui/react/field';

import cn from '@/lib/cn';

export type FieldInputProps = ArkField.InputProps;

export function FieldInput({ className, ...props }: FieldInputProps) {
    return (
        <ArkField.Input
            className={cn(
                'bg-input text-foreground placeholder:text-muted-foreground focus:ring-ring rounded-xl font-mono inset-shadow-xs transition-all outline-none focus:ring-2',
                'ark-invalid:ring-2 ark-invalid:ring-destructive ark-invalid:focus-visible:ring-destructive',
                'h-10 w-full px-3.5 text-xs sm:text-sm',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
}

export default FieldInput;
