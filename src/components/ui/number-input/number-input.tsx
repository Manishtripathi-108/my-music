'use client';

import { NumberInput as ArkNumberInput } from '@ark-ui/react/number-input';

import cn from '@/lib/cn';

export type NumberInputProps = ArkNumberInput.RootProps;

export function NumberInput({ className, ...props }: NumberInputProps) {
    return <ArkNumberInput.Root className={cn('flex w-full max-w-xs flex-col gap-1.5', className)} {...props} />;
}
