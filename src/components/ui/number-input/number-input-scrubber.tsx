'use client';

import { NumberInput as ArkNumberInput } from '@ark-ui/react/number-input';

import cn from '@/lib/cn';

export type NumberInputScrubberProps = ArkNumberInput.ScrubberProps;

export function NumberInputScrubber({ className, ...props }: NumberInputScrubberProps) {
    return <ArkNumberInput.Scrubber className={cn('cursor-ew-resize', className)} {...props} />;
}
