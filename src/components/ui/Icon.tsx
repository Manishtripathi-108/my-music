import { memo } from 'react';

import { IconProps, Icon as Iconify } from '@iconify/react';

import IconSet, { type Icon } from '@/constants/icons.constants';
import cn from '@/lib/utils/cn';

type Props = {
    icon: Icon;
    className?: string;
} & Omit<IconProps, 'icon' | 'className'>;

const Icon = ({ icon, className, ...props }: Props) => {
    return <Iconify data-component="icon" aria-hidden="true" icon={IconSet[icon]} className={cn('size-full', className)} {...props} />;
};

export default memo(Icon);
