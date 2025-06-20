"use client"

import { Home, Receipt, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Expenses } from "@/types/expenses"
import { formatCurrency } from "@/lib/format-currency"
import { useRouter, usePathname } from "next/navigation"
import { useContext } from "react"
import { useUserStore } from '@/store/user-store';

interface SidebarProps {
  expenses: Expenses[]
  collapsed: boolean
  toggleCollapsed: () => void
}

export function Sidebar({ expenses, collapsed, toggleCollapsed }: SidebarProps) {
  const totalExpense = expenses.filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = expenses.filter((e) => e.type === "income").reduce((sum, e) => sum + e.amount, 0)
  const router = useRouter()
  const pathname = usePathname()
  // const user = useUserStore((state) => state.user);

  // // if (!user) {
  // //   router.push("/login") // Redirect to login if user is not authenticated
  // // }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col space-y-1 p-2">
        <button
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            pathname === "/" ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
          onClick={() => router.push("/")}
        >
          <Home className="h-4 w-4" />
          {!collapsed && <span>메인</span>}
        </button>
        <button
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            pathname === "/expenses" ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
          onClick={() => router.push("/expenses")}
        >
          <Receipt className="h-4 w-4" />
          {!collapsed && <span>소비내역</span>}
        </button>
        <button
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            pathname === "/analytics" ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
          onClick={() => router.push("/analytics")}
        >
          <BarChart3 className="h-4 w-4" />
          {!collapsed && <span>분석</span>}
        </button>
        <button
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            pathname === "/settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
          onClick={() => router.push("/settings")}
        >
          <Settings className="h-4 w-4" />
          {!collapsed && <span>설정</span>}
        </button>
      </div>
    </div>
  )
}
