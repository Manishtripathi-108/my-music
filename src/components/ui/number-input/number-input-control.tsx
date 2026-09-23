'use client';

import { NumberInput as ArkNumberInput } from '@ark-ui/react/number-input';

import cn from '@/lib/utils/cn';

export type NumberInputControlProps = ArkNumberInput.ControlProps;

export function NumberInputControl({ className, ...props }: NumberInputControlProps) {
    return <ArkNumberInput.Control className={cn('relative flex items-center', className)} {...props} />;
}
