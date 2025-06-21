"use client";

import { CalendarView } from "@/components/calendar-view";
import { useExpenses } from "@/hooks/use-expenses";

export default function ExpensesRoutePage() {
  const { expenses } = useExpenses();
  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <CalendarView expenses={expenses} />
    </div>
  );
}
