'use client';

import React from 'react';

import { Progress as ArkProgress } from '@ark-ui/react/progress';

import cn from '@/lib/utils/cn';

export interface ProgressCircleProps extends ArkProgress.CircleProps {
    size?: number | string;
    thickness?: number | string;
}

export function ProgressCircle({ size = 80, thickness = 6, className, style, ...props }: ProgressCircleProps) {
    const sizeStr = typeof size === 'number' ? `${size}px` : size;
    const thicknessStr = typeof thickness === 'number' ? `${thickness}px` : thickness;

    return (
        <ArkProgress.Circle
            className={cn('ark-indeterminate:motion-preset-spin size-20', className)}
            style={
                {
                    '--size': sizeStr,
                    '--thickness': thicknessStr,
                    width: sizeStr,
                    height: sizeStr,
                    ...style,
                } as React.CSSProperties
            }
            {...props}
        />
    );
}
