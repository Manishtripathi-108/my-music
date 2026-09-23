'use client';

import { TreeView as ArkTreeView } from '@ark-ui/react/tree-view';

import Icon from '@/components/ui/icon';

import { TreeViewBranch } from './tree-view-branch';
import { TreeViewBranchContent } from './tree-view-branch-content';
import { TreeViewBranchControl } from './tree-view-branch-control';
import { TreeViewBranchIndicator } from './tree-view-branch-indicator';
import { TreeViewBranchText } from './tree-view-branch-text';
import { TreeViewItem } from './tree-view-item';
import { TreeViewItemText } from './tree-view-item-text';

export interface TreeNodeData {
    id: string;
    name: string;
    children?: TreeNodeData[];
}

export interface TreeNodeProps {
    node: TreeNodeData;
    indexPath: number[];
}

export function TreeNode({ node, indexPath }: TreeNodeProps) {
    return (
        <ArkTreeView.NodeProvider key={node.id} node={node} indexPath={indexPath}>
            <ArkTreeView.NodeContext>
                {(nodeState) =>
                    node.children && node.children.length > 0 ? (
                        <TreeViewBranch>
                            <TreeViewBranchControl>
                                <TreeViewBranchIndicator />
                                <TreeViewBranchText>
                                    <Icon icon={nodeState.expanded ? 'folderOpen' : 'folder'} className="text-primary size-4 shrink-0" />
                                    <span>{node.name}</span>
                                </TreeViewBranchText>
                            </TreeViewBranchControl>

                            <TreeViewBranchContent>
                                {node.children.map((child, index) => (
                                    <TreeNode key={child.id} node={child} indexPath={[...indexPath, index]} />
                                ))}
                            </TreeViewBranchContent>
                        </TreeViewBranch>
                    ) : (
                        <TreeViewItem>
                            <TreeViewItemText>
                                <Icon icon="file" className="text-muted-foreground size-3.5 shrink-0" />
                                <span>{node.name}</span>
                            </TreeViewItemText>
                        </TreeViewItem>
                    )
                }
            </ArkTreeView.NodeContext>
        </ArkTreeView.NodeProvider>
    );
}
