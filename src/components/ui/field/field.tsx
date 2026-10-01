'use client';

import { Field as ArkField } from '@ark-ui/react/field';

import cn from '@/lib/cn';

export type FieldProps = ArkField.RootProps;

export function Field({ className, ...props }: FieldProps) {
    return <ArkField.Root className={cn('flex w-full flex-col gap-1.5', className)} {...props} />;
}
