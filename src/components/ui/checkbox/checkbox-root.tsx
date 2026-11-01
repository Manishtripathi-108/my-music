'use client';

import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox';

import cn from '@/lib/cn';

/** Props for the root checkbox wrapper */
export interface CheckboxRootProps extends ArkCheckbox.RootProps {
    cardStyle?: boolean;
}

/**
 * Root container for Ark UI Checkbox with physical tactile feedback and accessible states.
 */
export function CheckboxRoot({ cardStyle = false, className, ...props }: CheckboxRootProps) {
    return (
        <ArkCheckbox.Root
            className={cn(
                'group inline-flex cursor-pointer items-center gap-2.5 text-sm outline-none select-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                cardStyle &&
                    'bg-card text-card-foreground ark-checked:bg-primary/5 w-full justify-between rounded-xl p-4 shadow-sm transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-md hover:brightness-[1.02] active:scale-[0.99] active:shadow-inner active:inset-shadow-xs',
                className
            )}
            {...props}
        />
    );
}

export default CheckboxRoot;
