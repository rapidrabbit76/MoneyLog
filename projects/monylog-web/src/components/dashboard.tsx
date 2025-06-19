"use client"

import { Button } from "@/components/ui/button"

import type React from "react"
import type { Expenses } from "@/types/expenses"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { UserStatus } from "@/components/user-status"
import { ChatInput } from "@/components/chat-input"
import { ExpenseViewList } from "@/components/transaction-list"
import { CalendarView } from "@/components/calendar-view"
import { SimpleTagManager } from "@/components/simple-category-manager"
import { ThemeToggle } from "@/components/theme-toggle"
import { parseExpense } from "@/lib/expense-message"
import { AnalyticsPage } from "@/components/analytics-page"
import { useExpenses } from "@/contexts/expenses-context"

interface DashboardProps {
  // No props needed now - using Context
}

export default function Dashboard({ }: DashboardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { expenses } = useExpenses()

  const defaultHandleChatSubmit = () => { }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <>
      {/* Top bar */}
      <header className="flex h-16 items-center border-b bg-card px-4 shadow-sm lg:px-6">
        <div className="flex items-center gap-4">
          <Logo />
          <h1 className="text-xl font-bold">가계부 챗</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <UserStatus user={user} onLogout={handleLogout} />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center border-b bg-card p-4 shadow-sm">
          <h2 className="text-lg font-medium">가계부</h2>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden p-4">
          {pathname === "/" && (
            <>
              <div className="mb-4">
                <ChatInput onSubmit={defaultHandleChatSubmit} />
              </div>
              <div className="flex-1 overflow-y-auto pb-4">
                <ExpenseViewList expenses={expenses} />
              </div>
            </>
          )}

          {pathname === "/expenses" && (
            <div className="flex-1 overflow-y-auto pb-4">
              <CalendarView expenses={expenses} />
            </div>
          )}

          {pathname === "/analytics" && (
            <div className="flex-1 overflow-y-auto pb-4">
              <AnalyticsPage expenses={expenses} />
            </div>
          )}

          {pathname === "/settings" && (
            <div className="flex-1 overflow-y-auto pb-4">
              <div className="space-y-8">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <h3 className="mb-6 text-xl font-medium">일반 설정</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">다크 모드</span>
                      <ThemeToggle />
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="mb-4 text-lg font-medium">계정 정보</h4>
                      <div className="space-y-2">
                        <p>
                          <span className="text-muted-foreground">이메일:</span> {user?.email}
                        </p>
                        <p>
                          <span className="text-muted-foreground">이름:</span> {user?.nickname}
                        </p>
                      </div>

                      <div className="flex gap-4 mt-6">
                        <Button variant="outline" onClick={() => router.push("/account")}>계정정보 수정</Button>
                        <Button variant="destructive" onClick={handleLogout}>로그아웃</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <SimpleTagManager />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
