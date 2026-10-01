'use client';

import { Field as ArkField } from '@ark-ui/react/field';

import cn from '@/lib/cn';

export type FieldLabelProps = ArkField.LabelProps;

export function FieldLabel({ className, children, ...props }: FieldLabelProps) {
    return (
        <ArkField.Label
            className={cn('text-foreground ark-invalid:text-destructive flex items-center gap-1 text-xs font-semibold tracking-wide', className)}
            {...props}>
            <span>{children}</span>
            <ArkField.RequiredIndicator className="text-destructive text-xs font-normal">*</ArkField.RequiredIndicator>
        </ArkField.Label>
    );
}
