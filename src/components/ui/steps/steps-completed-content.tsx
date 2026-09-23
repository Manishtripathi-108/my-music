'use client';

import { Steps as ArkSteps } from '@ark-ui/react/steps';

export type StepsCompletedContentProps = ArkSteps.CompletedContentProps;

export function StepsCompletedContent(props: StepsCompletedContentProps) {
    return <ArkSteps.CompletedContent {...props} />;
}
