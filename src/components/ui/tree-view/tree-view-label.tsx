'use client';

import { TreeView as ArkTreeView } from '@ark-ui/react/tree-view';

import cn from '@/lib/cn';

export type TreeViewLabelProps = ArkTreeView.LabelProps;

export function TreeViewLabel({ className, ...props }: TreeViewLabelProps) {
    return (
        <ArkTreeView.Label
            className={cn('text-muted-foreground mb-1 border-b px-1 pb-1 text-xs font-bold tracking-wider uppercase', className)}
            {...props}
        />
    );
}
