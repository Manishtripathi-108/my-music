'use client';

import { RadioGroup as ArkRadioGroup } from '@ark-ui/react/radio-group';

import cn from '@/lib/cn';

export type RadioGroupProps = ArkRadioGroup.RootProps;

export function RadioGroup({ className, ...props }: RadioGroupProps) {
    return <ArkRadioGroup.Root className={cn('flex w-full flex-col gap-2', className)} {...props} />;
}
