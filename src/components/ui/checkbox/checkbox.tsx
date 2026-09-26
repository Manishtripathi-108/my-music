'use client';

import React from 'react';

import { CheckboxControl } from './checkbox-control';
import { CheckboxHiddenInput } from './checkbox-hidden-input';
import { CheckboxLabel } from './checkbox-label';
import { CheckboxRoot, type CheckboxRootProps } from './checkbox-root';

export interface CheckboxProps extends CheckboxRootProps {
    label?: React.ReactNode;
    description?: React.ReactNode;
}

export function Checkbox({ label, description, cardStyle, className, children, ...props }: CheckboxProps) {
    return (
        <CheckboxRoot cardStyle={cardStyle} className={className} {...props}>
            <CheckboxHiddenInput />
            <CheckboxControl />
            {(label || description || children) && (
                <div className="flex flex-col">
                    {label && <CheckboxLabel>{label}</CheckboxLabel>}
                    {description && (
                        <span className="text-muted-foreground text-xs leading-relaxed">{description}</span>
                    )}
                    {children}
                </div>
            )}
        </CheckboxRoot>
    );
}

export default Checkbox;
