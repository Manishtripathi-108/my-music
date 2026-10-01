'use client';

import { TreeView as ArkTreeView } from '@ark-ui/react/tree-view';

import cn from '@/lib/cn';

export type TreeViewBranchControlProps = ArkTreeView.BranchControlProps;

export function TreeViewBranchControl({ className, style, ...props }: TreeViewBranchControlProps) {
    return (
        <ArkTreeView.BranchControl
            style={{ paddingInlineStart: 'calc(0.625rem + (var(--depth) - 1) * 1.125rem)', ...style }}
            className={cn(
                'text-foreground hover:bg-accent focus-visible:ring-ring ark-disabled:cursor-not-allowed ark-disabled:opacity-50 flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-2.5 text-xs font-semibold transition-colors select-none focus-visible:ring-2 focus-visible:outline-none',
                className
            )}
            {...props}
        />
    );
}
