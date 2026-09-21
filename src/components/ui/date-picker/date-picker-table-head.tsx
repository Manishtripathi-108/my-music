'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

export type DatePickerTableHeadProps = ArkDatePicker.TableHeadProps;

export function DatePickerTableHead(props: DatePickerTableHeadProps) {
    return <ArkDatePicker.TableHead {...props} />;
}
