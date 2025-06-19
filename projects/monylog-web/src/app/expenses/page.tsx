"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { CalendarView } from "@/components/calendar-view"
import { useExpenses } from "@/contexts/expenses-context"

export default function ExpensesRoutePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { expenses } = useExpenses()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>
  }

  if (!isAuthenticated) {
    return null // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <CalendarView expenses={expenses} />
    </div>
  )
}
