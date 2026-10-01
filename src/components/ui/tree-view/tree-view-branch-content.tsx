'use client';

import { TreeView as ArkTreeView } from '@ark-ui/react/tree-view';

import cn from '@/lib/cn';

export type TreeViewBranchContentProps = ArkTreeView.BranchContentProps;

export function TreeViewBranchContent({ className, children, ...props }: TreeViewBranchContentProps) {
    return (
        <ArkTreeView.BranchContent
            className={cn(
                'ark-open:motion-opacity-in-0 ark-open:motion-translate-y-in-[-4px]',
                'ark-closed:motion-opacity-out-0 ark-closed:motion-translate-y-out-[-4px] ark-closed:motion-duration-150',
                'motion-duration-200 motion-ease-spring-smooth relative overflow-hidden',
                className
            )}
            {...props}>
            <ArkTreeView.BranchIndentGuide
                style={{ insetInlineStart: 'calc(0.625rem + (var(--depth) - 1) * 1.125rem + 0.45rem)' }}
                className="bg-border absolute top-0 bottom-0 w-px"
            />
            <div className="flex flex-col gap-0.5 pt-0.5">{children}</div>
        </ArkTreeView.BranchContent>
    );
}
