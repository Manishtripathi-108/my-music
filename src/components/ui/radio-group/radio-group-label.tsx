'use client';

import { RadioGroup as ArkRadioGroup } from '@ark-ui/react/radio-group';

import cn from '@/lib/cn';

export type RadioGroupLabelProps = ArkRadioGroup.LabelProps;

export function RadioGroupLabel({ className, ...props }: RadioGroupLabelProps) {
    return <ArkRadioGroup.Label className={cn('text-foreground mb-1 text-xs font-semibold tracking-wide', className)} {...props} />;
}
