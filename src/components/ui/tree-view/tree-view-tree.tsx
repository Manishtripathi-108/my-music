'use client';

import { TreeView as ArkTreeView } from '@ark-ui/react/tree-view';

import cn from '@/lib/cn';

export type TreeViewTreeProps = ArkTreeView.TreeProps;

export function TreeViewTree({ className, ...props }: TreeViewTreeProps) {
    return <ArkTreeView.Tree className={cn('flex flex-col gap-0.5', className)} {...props} />;
}
