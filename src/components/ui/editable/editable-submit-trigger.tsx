'use client';

import { Editable as ArkEditable } from '@ark-ui/react/editable';

import Icon from '@/components/ui/icon';
import cn from '@/lib/utils/cn';

export type EditableSubmitTriggerProps = ArkEditable.SubmitTriggerProps;

export function EditableSubmitTrigger({ className, children, ...props }: EditableSubmitTriggerProps) {
    return (
        <ArkEditable.SubmitTrigger
            aria-label="Save changes"
            className={cn(
                'text-primary hover:bg-primary/10 flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors',
                className
            )}
            {...props}>
            {children ?? <Icon icon="check" className="size-3.5" />}
        </ArkEditable.SubmitTrigger>
    );
}
