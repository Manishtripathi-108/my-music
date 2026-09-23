'use client';

import { Steps as ArkSteps } from '@ark-ui/react/steps';

import cn from '@/lib/utils/cn';

export type StepsItemProps = ArkSteps.ItemProps;

export function StepsItem({ className, ...props }: StepsItemProps) {
    return (
        <ArkSteps.Item
            className={cn('group group/item flex flex-1 cursor-pointer items-center gap-3 last-of-type:flex-initial', className)}
            {...props}
        />
    );
}
