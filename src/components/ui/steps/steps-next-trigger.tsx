'use client';

import { Steps as ArkSteps } from '@ark-ui/react/steps';

export type StepsNextTriggerProps = ArkSteps.NextTriggerProps;

export function StepsNextTrigger(props: StepsNextTriggerProps) {
    return <ArkSteps.NextTrigger {...props} />;
}
