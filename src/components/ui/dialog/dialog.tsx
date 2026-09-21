'use client';

import { Dialog as ArkDialog } from '@ark-ui/react/dialog';

export type DialogProps = ArkDialog.RootProps;

export function Dialog(props: DialogProps) {
    return <ArkDialog.Root {...props} />;
}
