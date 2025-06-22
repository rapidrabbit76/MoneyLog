import * as React from "react";
import { Calendar } from "./calendar";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface CustomCalendarProps {
    value?: { from?: Date; to?: Date };
    onChange?: (range: { from?: string; to?: string }) => void;
    disabled?: boolean;
}

/**
 * CustomCalendar wraps the shadcn Calendar and emits date range in "yyyy-MM-dd" format.
 */
export function CustomCalendar({ value, onChange, disabled }: CustomCalendarProps) {
    const [displayMonth, setDisplayMonth] = React.useState(() => value?.from ?? new Date());

    // Year/Month dropdowns
    const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    const handleSelect = (range: { from?: Date; to?: Date }) => {
        if (onChange) {
            onChange({
                from: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
                to: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
            });
        }
    };

    const handleYearChange = (year: string) => {
        setDisplayMonth((prev) => {
            const d = new Date(prev);
            d.setFullYear(Number(year));
            return d;
        });
    };
    const handleMonthChange = (month: string) => {
        setDisplayMonth((prev) => {
            const d = new Date(prev);
            d.setMonth(Number(month));
            return d;
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <Calendar
                mode="range"
                selected={value}
                onSelect={handleSelect}
                disabled={disabled}
                initialFocus
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                className="rounded-lg border shadow-sm"
            />
            <div className="flex flex-col gap-3">
                <Label htmlFor="calendar-month-year-dropdown" className="px-1 text-xs">Month/Year</Label>
                <div className="flex gap-2">
                    <Select value={String(displayMonth.getFullYear())} onValueChange={handleYearChange}>
                        <SelectTrigger id="calendar-month-year-dropdown" className="bg-background w-24 text-xs h-8">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent align="center">
                            {years.map((y) => (
                                <SelectItem key={y} value={String(y)} className="text-xs h-8">{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={String(displayMonth.getMonth())} onValueChange={handleMonthChange}>
                        <SelectTrigger className="bg-background w-16 text-xs h-8">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent align="center">
                            {months.map((m) => (
                                <SelectItem key={m} value={String(m)} className="text-xs h-8">{m + 1}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
