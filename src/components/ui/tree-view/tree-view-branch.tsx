'use client';

import { TreeView as ArkTreeView } from '@ark-ui/react/tree-view';

import cn from '@/lib/utils/cn';

export type TreeViewBranchProps = ArkTreeView.BranchProps;

export function TreeViewBranch({ className, ...props }: TreeViewBranchProps) {
    return <ArkTreeView.Branch className={cn('relative', className)} {...props} />;
}
