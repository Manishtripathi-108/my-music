'use client';

import { Editable as ArkEditable } from '@ark-ui/react/editable';

import cn from '@/lib/utils/cn';

export type EditableInputProps = ArkEditable.InputProps;

export function EditableInput({ className, ...props }: EditableInputProps) {
    return (
        <ArkEditable.Input className={cn('text-foreground w-full flex-1 bg-transparent text-sm font-medium outline-none', className)} {...props} />
    );
}
