'use client';

import { Editable as ArkEditable } from '@ark-ui/react/editable';

import cn from '@/lib/cn';

export type EditablePreviewProps = ArkEditable.PreviewProps;

export function EditablePreview({ className, ...props }: EditablePreviewProps) {
    return (
        <ArkEditable.Preview
            className={cn(
                'text-foreground ark-invalid:text-destructive ark-disabled:text-muted-foreground ark-disabled:cursor-not-allowed flex-1 cursor-pointer truncate text-sm font-medium focus-visible:outline-none',
                className
            )}
            {...props}
        />
    );
}
