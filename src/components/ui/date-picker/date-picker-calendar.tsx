'use client';

import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';

import { DatePickerNextTrigger } from './date-picker-next-trigger';
import { DatePickerPrevTrigger } from './date-picker-prev-trigger';
import { DatePickerRangeText } from './date-picker-range-text';
import { DatePickerTable } from './date-picker-table';
import { DatePickerTableBody } from './date-picker-table-body';
import { DatePickerTableCell } from './date-picker-table-cell';
import { DatePickerTableCellTrigger } from './date-picker-table-cell-trigger';
import { DatePickerTableHead } from './date-picker-table-head';
import { DatePickerTableHeader } from './date-picker-table-header';
import { DatePickerTableRow } from './date-picker-table-row';
import { DatePickerView } from './date-picker-view';
import { DatePickerViewControl } from './date-picker-view-control';
import { DatePickerViewTrigger } from './date-picker-view-trigger';

export function DatePickerCalendar() {
    return (
        <>
            {/* Day View */}
            <DatePickerView view="day">
                <ArkDatePicker.Context>
                    {(datePicker) => (
                        <>
                            <DatePickerViewControl>
                                <DatePickerPrevTrigger />
                                <DatePickerViewTrigger>
                                    <DatePickerRangeText />
                                </DatePickerViewTrigger>
                                <DatePickerNextTrigger />
                            </DatePickerViewControl>

                            <DatePickerTable>
                                <DatePickerTableHead>
                                    <DatePickerTableRow className="mb-1 grid grid-cols-7">
                                        {datePicker.weekDays.map((weekDay, id) => (
                                            <DatePickerTableHeader key={`weekday-${id}-${weekDay.short}`}>{weekDay.short}</DatePickerTableHeader>
                                        ))}
                                    </DatePickerTableRow>
                                </DatePickerTableHead>
                                <DatePickerTableBody>
                                    {datePicker.weeks.map((week, weekIdx) => (
                                        <DatePickerTableRow key={`week-${weekIdx}`} className="grid grid-cols-7">
                                            {week.map((day, dayIdx) => (
                                                <DatePickerTableCell key={`day-${weekIdx}-${dayIdx}-${day.toString()}`} value={day}>
                                                    <DatePickerTableCellTrigger>{day.day}</DatePickerTableCellTrigger>
                                                </DatePickerTableCell>
                                            ))}
                                        </DatePickerTableRow>
                                    ))}
                                </DatePickerTableBody>
                            </DatePickerTable>
                        </>
                    )}
                </ArkDatePicker.Context>
            </DatePickerView>

            {/* Month View */}
            <DatePickerView view="month">
                <ArkDatePicker.Context>
                    {(datePicker) => (
                        <>
                            <DatePickerViewControl>
                                <DatePickerPrevTrigger />
                                <DatePickerViewTrigger>
                                    <DatePickerRangeText />
                                </DatePickerViewTrigger>
                                <DatePickerNextTrigger />
                            </DatePickerViewControl>

                            <DatePickerTable>
                                <DatePickerTableBody className="flex flex-col gap-2">
                                    {datePicker.getMonthsGrid({ columns: 4, format: 'short' }).map((months, rowIdx) => (
                                        <DatePickerTableRow key={`month-row-${rowIdx}`} className="grid grid-cols-4 gap-1.5">
                                            {months.map((month, colIdx) => (
                                                <DatePickerTableCell key={`month-cell-${rowIdx}-${colIdx}-${month.value}`} value={month.value}>
                                                    <DatePickerTableCellTrigger>{month.label}</DatePickerTableCellTrigger>
                                                </DatePickerTableCell>
                                            ))}
                                        </DatePickerTableRow>
                                    ))}
                                </DatePickerTableBody>
                            </DatePickerTable>
                        </>
                    )}
                </ArkDatePicker.Context>
            </DatePickerView>

            {/* Year View */}
            <DatePickerView view="year">
                <ArkDatePicker.Context>
                    {(datePicker) => (
                        <>
                            <DatePickerViewControl>
                                <DatePickerPrevTrigger />
                                <DatePickerViewTrigger>
                                    <DatePickerRangeText />
                                </DatePickerViewTrigger>
                                <DatePickerNextTrigger />
                            </DatePickerViewControl>

                            <DatePickerTable>
                                <DatePickerTableBody className="flex flex-col gap-2">
                                    {datePicker.getYearsGrid({ columns: 4 }).map((years, rowIdx) => (
                                        <DatePickerTableRow key={`year-row-${rowIdx}`} className="grid grid-cols-4 gap-1.5">
                                            {years.map((year, colIdx) => (
                                                <DatePickerTableCell key={`year-cell-${rowIdx}-${colIdx}-${year.value}`} value={year.value}>
                                                    <DatePickerTableCellTrigger>{year.label}</DatePickerTableCellTrigger>
                                                </DatePickerTableCell>
                                            ))}
                                        </DatePickerTableRow>
                                    ))}
                                </DatePickerTableBody>
                            </DatePickerTable>
                        </>
                    )}
                </ArkDatePicker.Context>
            </DatePickerView>
        </>
    );
}
