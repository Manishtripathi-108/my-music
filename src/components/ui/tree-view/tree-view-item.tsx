'use client';

import { TreeView as ArkTreeView } from '@ark-ui/react/tree-view';

import cn from '@/lib/cn';

export type TreeViewItemProps = ArkTreeView.ItemProps;

export function TreeViewItem({ className, style, ...props }: TreeViewItemProps) {
    return (
        <ArkTreeView.Item
            style={{ paddingInlineStart: 'calc(0.625rem + (var(--depth) - 1) * 1.125rem + 1.375rem)', ...style }}
            className={cn(
                'text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring data-[selected]:bg-primary/10 data-[selected]:text-primary flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-2.5 text-xs font-medium transition-colors select-none focus-visible:ring-2 focus-visible:outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                className
            )}
            {...props}
        />
    );
}
