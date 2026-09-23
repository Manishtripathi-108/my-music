'use client';

import { Editable as ArkEditable } from '@ark-ui/react/editable';

import cn from '@/lib/utils/cn';

export type EditableControlProps = ArkEditable.ControlProps;

export function EditableControl({ className, ...props }: EditableControlProps) {
    return <ArkEditable.Control className={cn('flex shrink-0 items-center gap-1', className)} {...props} />;
}
