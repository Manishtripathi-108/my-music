'use client';

import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox';

import cn from '@/lib/utils/cn';

export type CheckboxLabelProps = ArkCheckbox.LabelProps;

export function CheckboxLabel({ className, ...props }: CheckboxLabelProps) {
    return (
        <ArkCheckbox.Label
            className={cn('text-sm font-medium text-foreground select-none', className)}
            {...props}
        />
    );
}

export default CheckboxLabel;
