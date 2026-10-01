'use client';

import { Editable as ArkEditable } from '@ark-ui/react/editable';

import Icon from '@/components/ui/Icon';
import cn from '@/lib/cn';

export type EditableCancelTriggerProps = ArkEditable.CancelTriggerProps;

export function EditableCancelTrigger({ className, children, ...props }: EditableCancelTriggerProps) {
    return (
        <ArkEditable.CancelTrigger
            aria-label="Cancel editing"
            className={cn(
                'text-destructive hover:bg-destructive/10 flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors',
                className
            )}
            {...props}>
            {children ?? <Icon icon="close" className="size-3.5" />}
        </ArkEditable.CancelTrigger>
    );
}
