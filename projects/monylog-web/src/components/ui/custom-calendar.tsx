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
    const handleSelect = (range: { from?: Date; to?: Date }) => {
        if (onChange) {
            onChange({
                from: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
                to: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
            });
        }
    };



    return (
        <div className="flex flex-col gap-4">
            <Calendar
                mode="range"
                selected={value}
                onSelect={handleSelect}
                disabled={disabled}
                captionLayout="dropdown"
                className="rounded-lg border shadow-sm"
            />
        </div>
    );
}
