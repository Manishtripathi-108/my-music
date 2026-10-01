'use client';

import { NumberInput as ArkNumberInput } from '@ark-ui/react/number-input';

import cn from '@/lib/cn';

export type NumberInputLabelProps = ArkNumberInput.LabelProps;

export function NumberInputLabel({ className, ...props }: NumberInputLabelProps) {
    return <ArkNumberInput.Label className={cn('text-foreground text-xs font-semibold tracking-wide', className)} {...props} />;
}
