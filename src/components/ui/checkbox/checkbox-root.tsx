'use client';

import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox';

import cn from '@/lib/utils/cn';

export interface CheckboxRootProps extends ArkCheckbox.RootProps {
    cardStyle?: boolean;
}

export function CheckboxRoot({ cardStyle = false, className, ...props }: CheckboxRootProps) {
    return (
        <ArkCheckbox.Root
            className={cn(
                'group inline-flex cursor-pointer items-center gap-2.5 text-sm select-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                cardStyle &&
                    'bg-card hover:border-primary/40 ark-checked:border-primary ark-checked:bg-primary/5 rounded-xl border p-4 transition-all w-full justify-between',
                className
            )}
            {...props}
        />
    );
}

export default CheckboxRoot;
