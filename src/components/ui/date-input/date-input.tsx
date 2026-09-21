'use client';

import { DateInput as ArkDateInput } from '@ark-ui/react/date-input';

import cn from '@/lib/utils/cn';

export type DateInputProps = ArkDateInput.RootProps;

export function DateInput({ className, locale = 'en-IN', ...props }: DateInputProps) {
    return <ArkDateInput.Root className={cn('flex w-full max-w-xs flex-col gap-1.5', className)} locale={locale} {...props} />;
}
