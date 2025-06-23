"use client";

import { CalendarView } from "@/components/calendar-view";
import { useExpenses } from "@/hooks/use-expenses";
import { ExpenseTag } from "@/lib/api/tags";
import { useExpensesStore } from "@/store/expenses-store";
import { useTagStore } from "@/store/tag-store";
import { Expenses } from "@/types/expenses";
import { useEffect, useState } from "react";

export default function ExpensesRoutePage() {
  const [tags, setTags] = useState<ExpenseTag[]>([]);
  useEffect(() => {
    const storedTags = useTagStore.getState().tags;
    if (storedTags.length > 0) {
      setTags(storedTags);
      return;
    }
    useTagStore.getState().fetchTags().then((fetchedTags) => {
      setTags(fetchedTags);
    });
  }, []);





  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <CalendarView expenses={[]} />
    </div>
  );
}
