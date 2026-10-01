'use client';

import { TreeView as ArkTreeView } from '@ark-ui/react/tree-view';

import Icon from '@/components/ui/Icon';
import cn from '@/lib/cn';

export type TreeViewBranchIndicatorProps = ArkTreeView.BranchIndicatorProps;

export function TreeViewBranchIndicator({ className, children, ...props }: TreeViewBranchIndicatorProps) {
    return (
        <ArkTreeView.BranchIndicator
            className={cn('text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-90', className)}
            {...props}>
            {children ?? <Icon icon="chevronRight" className="size-3.5" />}
        </ArkTreeView.BranchIndicator>
    );
}
