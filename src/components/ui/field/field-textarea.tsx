'use client';

import { Field as ArkField } from '@ark-ui/react/field';

import cn from '@/lib/cn';

export type FieldTextareaProps = ArkField.TextareaProps;

export function FieldTextarea({ className, ...props }: FieldTextareaProps) {
    return (
        <ArkField.Textarea
            className={cn(
                'bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring',
                'ark-invalid:border-destructive ark-invalid:focus-visible:ring-destructive',
                'w-full rounded-xl border p-3.5 text-sm transition-all',
                'focus-visible:border-transparent focus-visible:ring-2 focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
}
