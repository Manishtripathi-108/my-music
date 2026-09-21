'use client';

import { Drawer as ArkDrawer } from '@ark-ui/react/drawer';

export type DrawerTriggerProps = ArkDrawer.TriggerProps;

export function DrawerTrigger(props: DrawerTriggerProps) {
    return <ArkDrawer.Trigger {...props} />;
}
