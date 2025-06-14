"use client"

import { Home, Receipt, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/types/transaction"
import { formatCurrency } from "@/lib/format-currency"
import { useRouter } from "next/navigation"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  transactions: Transaction[]
  collapsed: boolean
  toggleCollapsed: () => void
}

export function Sidebar({ activeTab, setActiveTab, transactions, collapsed, toggleCollapsed }: SidebarProps) {
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
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
            activeTab === "transactions"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
          onClick={() => setActiveTab("transactions")}
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

      {!collapsed && (
        <>
          <div className="mt-4 border-t pt-4">
            <div className="px-4 py-2">
              <h3 className="mb-2 text-sm font-medium">요약</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">총 지출:</span>
                  <span className="font-medium text-red-500 dark:text-red-400">{formatCurrency(totalExpense)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">총 수입:</span>
                  <span className="font-medium text-blue-500 dark:text-blue-400">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-medium">잔액:</span>
                  <span className="font-medium">{formatCurrency(totalIncome - totalExpense)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === "main" && (
              <div className="mt-4 px-4 h-full overflow-y-auto">
                <h3 className="mb-2 text-sm font-medium">최근 거래</h3>
                <div className="space-y-2">
                  {transactions.slice(0, 8).map((transaction, index) => (
                    <div key={index} className="rounded-md border bg-card p-2 text-sm shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{transaction.description}</span>
                        <span
                          className={
                            transaction.type === "expense"
                              ? "text-red-500 dark:text-red-400"
                              : "text-blue-500 dark:text-blue-400"
                          }
                        >
                          {transaction.type === "expense" ? "-" : "+"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{transaction.category}</span>
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
