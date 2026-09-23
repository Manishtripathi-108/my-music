'use client';

import { Editable as ArkEditable } from '@ark-ui/react/editable';

import cn from '@/lib/utils/cn';

export type EditableLabelProps = ArkEditable.LabelProps;

export function EditableLabel({ className, ...props }: EditableLabelProps) {
    return (
        <ArkEditable.Label
            className={cn(
                'text-foreground ark-invalid:text-destructive ark-disabled:text-muted-foreground text-xs font-semibold tracking-wide',
                className
            )}
            {...props}
        />
    );
}
