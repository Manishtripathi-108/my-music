'use client';

import { TreeView as ArkTreeView } from '@ark-ui/react/tree-view';

import cn from '@/lib/cn';

export type TreeViewBranchTextProps = ArkTreeView.BranchTextProps;

export function TreeViewBranchText({ className, ...props }: TreeViewBranchTextProps) {
    return <ArkTreeView.BranchText className={cn('flex items-center gap-2', className)} {...props} />;
}
