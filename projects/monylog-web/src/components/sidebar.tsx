"use client"

import { Home, Receipt, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Expenses } from "@/types/expenses"
import { formatCurrency } from "@/lib/format-currency"
import { useRouter } from "next/navigation"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  expenses: Expenses[]
  collapsed: boolean
  toggleCollapsed: () => void
}

export function Sidebar({ activeTab, setActiveTab, expenses, collapsed, toggleCollapsed }: SidebarProps) {
  const totalExpense = expenses.filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = expenses.filter((e) => e.type === "income").reduce((sum, e) => sum + e.amount, 0)
  const router = useRouter()

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col space-y-1 p-2">
        <button
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            activeTab === "main" ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
          onClick={() => setActiveTab("main")}
        >
          <Home className="h-4 w-4" />
          {!collapsed && <span>메인</span>}
        </button>
        <button
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            activeTab === "expenses"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
          onClick={() => setActiveTab("expenses")}
        >
          <Receipt className="h-4 w-4" />
          {!collapsed && <span>소비내역</span>}
        </button>
        <button
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            activeTab === "analytics" ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
          onClick={() => {
            setActiveTab("analytics")
            router.push("/analytics")
          }}
        >
          <BarChart3 className="h-4 w-4" />
          {!collapsed && <span>분석</span>}
        </button>
        <button
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            activeTab === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
          onClick={() => setActiveTab("settings")}
        >
          <Settings className="h-4 w-4" />
          {!collapsed && <span>설정</span>}
        </button>
      </div>
    </div>
  )
}
