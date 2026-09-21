'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

export type DatePickerRangeTextProps = ArkDatePicker.RangeTextProps;

export function DatePickerRangeText(props: DatePickerRangeTextProps) {
    return <ArkDatePicker.RangeText {...props} />;
}
