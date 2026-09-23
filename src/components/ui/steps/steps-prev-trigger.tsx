'use client';

import { Steps as ArkSteps } from '@ark-ui/react/steps';

export type StepsPrevTriggerProps = ArkSteps.PrevTriggerProps;

export function StepsPrevTrigger(props: StepsPrevTriggerProps) {
    return <ArkSteps.PrevTrigger {...props} />;
}
