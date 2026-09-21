'use client';

import { Dialog as ArkDialog } from '@ark-ui/react/dialog';

export type DialogTriggerProps = ArkDialog.TriggerProps;

export function DialogTrigger(props: DialogTriggerProps) {
    return <ArkDialog.Trigger {...props} />;
}
