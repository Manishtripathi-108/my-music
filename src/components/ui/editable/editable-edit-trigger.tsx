'use client';

import { Editable as ArkEditable } from '@ark-ui/react/editable';

import Icon from '@/components/ui/icon';
import cn from '@/lib/utils/cn';

export type EditableEditTriggerProps = ArkEditable.EditTriggerProps;

export function EditableEditTrigger({ className, children, ...props }: EditableEditTriggerProps) {
    return (
        <ArkEditable.EditTrigger
            aria-label="Edit text"
            className={cn(
                'text-muted-foreground hover:text-foreground hover:bg-accent flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors',
                className
            )}
            {...props}>
            {children ?? <Icon icon="edit" className="size-3.5" />}
        </ArkEditable.EditTrigger>
    );
}
