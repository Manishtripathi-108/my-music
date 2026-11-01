'use client';

import { Field as ArkField } from '@ark-ui/react/field';

import cn from '@/lib/cn';

export type FieldTextareaProps = ArkField.TextareaProps;

export function FieldTextarea({ className, ...props }: FieldTextareaProps) {
    return (
        <ArkField.Textarea
            className={cn(
                'bg-input text-foreground placeholder:text-muted-foreground focus:ring-ring rounded-xl font-mono inset-shadow-xs transition-all outline-none focus:ring-2',
                'ark-invalid:ring-2 ark-invalid:ring-destructive ark-invalid:focus-visible:ring-destructive',
                'w-full p-3.5 text-sm transition-all',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
}

export default FieldTextarea;
