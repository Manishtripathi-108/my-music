import { memo } from 'react';

import { IconProps, Icon as Iconify } from '@iconify/react';

import IconSet from '@/constants/icons.constants';
import cn from '@/lib/cn';

export type IconName = keyof typeof IconSet;

export interface IconComponentProps extends Omit<IconProps, 'icon' | 'className'> {
    icon: IconName;
    className?: string;
}

export function Icon({ icon, className, ...props }: IconComponentProps) {
    return <Iconify data-component="icon" aria-hidden="true" icon={IconSet[icon]} className={cn('size-full', className)} {...props} />;
}

export default memo(Icon);
