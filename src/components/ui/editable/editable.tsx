'use client';

import { Editable as ArkEditable } from '@ark-ui/react/editable';

import cn from '@/lib/cn';

export type EditableProps = ArkEditable.RootProps;

export function Editable({ className, ...props }: EditableProps) {
    return <ArkEditable.Root className={cn('flex w-full max-w-sm flex-col gap-1.5', className)} {...props} />;
}
