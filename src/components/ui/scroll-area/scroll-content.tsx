'use client';

import { ScrollArea as ArkScrollArea } from '@ark-ui/react/scroll-area';

export type ScrollContentProps = ArkScrollArea.ContentProps;

export function ScrollContent(props: ScrollContentProps) {
    return <ArkScrollArea.Content {...props} />;
}
