'use client';

import { RadioGroup as ArkRadioGroup } from '@ark-ui/react/radio-group';

import cn from '@/lib/cn';

export type RadioGroupIndicatorProps = ArkRadioGroup.IndicatorProps;

export function RadioGroupIndicator({ className, ...props }: RadioGroupIndicatorProps) {
    return <ArkRadioGroup.Indicator className={cn('bg-primary transition-all duration-200', className)} {...props} />;
}
