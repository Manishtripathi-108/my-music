'use client';

import { Editable as ArkEditable } from '@ark-ui/react/editable';

import cn from '@/lib/utils/cn';

export type EditableAreaProps = ArkEditable.AreaProps;

export function EditableArea({ className, ...props }: EditableAreaProps) {
    return (
        <ArkEditable.Area
            className={cn(
                'bg-card ark-invalid:border-destructive focus-within:ring-ring ark-invalid:ring-destructive not-ark-disabled:hover:border-primary/50 ark-disabled:cursor-not-allowed relative flex items-center justify-between gap-2 rounded-xl border px-3 py-2 transition-all focus-within:border-transparent focus-within:ring-2 focus-within:outline-none',
                className
            )}
            {...props}
        />
    );
}
