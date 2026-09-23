'use client';

import { Steps as ArkSteps } from '@ark-ui/react/steps';

export type StepsContentProps = ArkSteps.ContentProps;

export function StepsContent(props: StepsContentProps) {
    return <ArkSteps.Content {...props} />;
}
