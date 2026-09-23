'use client';

import { TreeView as ArkTreeView } from '@ark-ui/react/tree-view';

import cn from '@/lib/utils/cn';

export type TreeViewProps<T = unknown> = ArkTreeView.RootProps<T>;

export function TreeView<T>({ className, ...props }: TreeViewProps<T>) {
    return <ArkTreeView.Root className={cn('bg-card flex w-full max-w-sm flex-col gap-2 rounded-2xl border p-4 shadow-xs', className)} {...props} />;
}
