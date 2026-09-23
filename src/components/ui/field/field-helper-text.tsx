'use client';

import { Field as ArkField } from '@ark-ui/react/field';

import cn from '@/lib/utils/cn';

export type FieldHelperTextProps = ArkField.HelperTextProps;

export function FieldHelperText({ className, ...props }: FieldHelperTextProps) {
    return <ArkField.HelperText className={cn('text-muted-foreground text-[10px]', className)} {...props} />;
}
