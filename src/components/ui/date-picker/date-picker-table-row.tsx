'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

export type DatePickerTableRowProps = ArkDatePicker.TableRowProps;

export function DatePickerTableRow(props: DatePickerTableRowProps) {
    return <ArkDatePicker.TableRow {...props} />;
}
