'use client';

import { ScrollArea as ArkScrollArea } from '@ark-ui/react/scroll-area';

export type ScrollCornerProps = ArkScrollArea.CornerProps;

export function ScrollCorner(props: ScrollCornerProps) {
    return <ArkScrollArea.Corner {...props} />;
}
