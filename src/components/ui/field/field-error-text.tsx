'use client';

import { Field as ArkField } from '@ark-ui/react/field';

import Icon from '@/components/ui/icon';
import cn from '@/lib/utils/cn';

export type FieldErrorTextProps = ArkField.ErrorTextProps;

export function FieldErrorText({ className, children, ...props }: FieldErrorTextProps) {
    return (
        <ArkField.ErrorText className={cn('text-destructive text-[10px] mt-0.5 flex items-center gap-1 font-medium', className)} {...props}>
            <Icon icon="alert" className="size-3.5 shrink-0" />
            <span>{children}</span>
        </ArkField.ErrorText>
    );
}
