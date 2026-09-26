'use client';

import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox';

import Icon from '@/components/ui/icon';
import cn from '@/lib/utils/cn';

export type CheckboxIndicatorProps = ArkCheckbox.IndicatorProps;

export function CheckboxIndicator({ className, children, ...props }: CheckboxIndicatorProps) {
    return (
        <ArkCheckbox.Indicator
            className={cn(
                'ark-checked:motion-scale-in-75 ark-checked:motion-opacity-in-0 motion-duration-150 motion-ease-spring-smooth flex items-center justify-center text-current',
                className
            )}
            {...props}>
            {children ?? <Icon icon="check" className="size-3" />}
        </ArkCheckbox.Indicator>
    );
}

export default CheckboxIndicator;
