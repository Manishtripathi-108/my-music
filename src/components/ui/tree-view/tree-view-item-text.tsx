'use client';

import { TreeView as ArkTreeView } from '@ark-ui/react/tree-view';

import cn from '@/lib/utils/cn';

export type TreeViewItemTextProps = ArkTreeView.ItemTextProps;

export function TreeViewItemText({ className, ...props }: TreeViewItemTextProps) {
    return <ArkTreeView.ItemText className={cn('flex items-center gap-2', className)} {...props} />;
}
