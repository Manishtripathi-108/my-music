'use client';

import { Steps as ArkSteps } from '@ark-ui/react/steps';

import Icon from '@/components/ui/Icon';
import cn from '@/lib/cn';

export type StepsIndicatorProps = ArkSteps.IndicatorProps;

export function StepsIndicator({ className, children, ...props }: StepsIndicatorProps) {
    return (
        <ArkSteps.Indicator
            className={cn(
                'group/indicator flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-2xs transition-all',
                'bg-card text-muted-foreground',
                'ark-current:bg-primary ark-current:text-primary-foreground ark-current:shadow-sm',
                'ark-complete:bg-primary/10 ark-complete:text-primary ark-complete:shadow-2xs',
                className
            )}
            {...props}>
            <span className="ark-group-complete:hidden">{children}</span>
            <Icon icon="check" className="ark-group-complete:block hidden size-4" />
        </ArkSteps.Indicator>
    );
}
