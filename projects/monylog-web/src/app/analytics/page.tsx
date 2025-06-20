"use client"

import { AnalyticsPage } from "@/components/analytics-page"
import { useExpenses } from "@/contexts/expenses-context"

export default function AnalyticsRoutePage() {
  const { expenses } = useExpenses()
  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <AnalyticsPage expenses={expenses} />
    </div>
  )
}
