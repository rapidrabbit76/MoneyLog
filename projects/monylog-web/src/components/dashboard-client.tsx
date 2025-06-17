"use client"

import { Button } from "@/components/ui/button"

import type React from "react"
import type { User } from "@/types/auth"
import type { Transaction } from "@/types/transaction"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { UserStatus } from "@/components/user-status"
import { Sidebar } from "@/components/sidebar"
import { ChatInput } from "@/components/chat-input"
import { TransactionList } from "@/components/transaction-list"
import { CalendarView } from "@/components/calendar-view"
import { ThemeToggle } from "@/components/theme-toggle"
import { parseTransaction } from "@/lib/expense-message"
import { logout } from "@/lib/auth-client"

interface DashboardClientProps {
  initialUser: User
  initialTab?: string
}

export default function DashboardClient({ initialUser, initialTab = "main" }: DashboardClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User>(initialUser)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("transactions", [])
  const [isResizing, setIsResizing] = useState(false)

  const handleChatSubmit = (message: string) => {
    const transaction = parseTransaction(message)
    if (transaction) {
      setTransactions([transaction, ...transactions])
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  // 사이드바 너비에 따라 아이콘 모드 설정
  const updateSidebarState = (width: number) => {
    setSidebarWidth(width)
    setSidebarCollapsed(width < 180)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = e.clientX
      if (newWidth > 60 && newWidth < 500) {
        updateSidebarState(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing])

  // 사이드바 토글 시 너비 조정
  const toggleSidebar = () => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
      // 사이드바를 다시 열 때 이전 너비 복원
      updateSidebarState(sidebarWidth)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)

    // 라우터를 사용하여 페이지 이동
    switch (tab) {
      case "main":
        router.push("/")
        break
      case "transactions":
        router.push("/transactions")
        break
      case "settings":
        router.push("/settings")
        break
      default:
        router.push("/")
    }
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "border-r bg-card transition-all duration-300 ease-in-out",
            sidebarOpen ? "block" : "hidden w-0",
          )}
          style={{ width: sidebarOpen ? `${sidebarWidth}px` : 0 }}
        >
          <Sidebar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            transactions={transactions}
            collapsed={sidebarCollapsed}
            toggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Resize handle */}
        {sidebarOpen && (
          <div
            className="w-1 cursor-col-resize bg-border hover:bg-primary/50 active:bg-primary"
            onMouseDown={handleMouseDown}
          />
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center border-b bg-card p-4 shadow-sm">
            <button
              className="mr-4 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <h2 className="text-lg font-medium">가계부</h2>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden p-4">
            {activeTab === "main" && (
              <>
                <div className="mb-4">
                  <ChatInput onSubmit={handleChatSubmit} />
                </div>
                <div className="flex-1 overflow-y-auto pb-4">
                  <TransactionList transactions={transactions} />
                </div>
              </>
            )}

            {activeTab === "transactions" && (
              <div className="flex-1 overflow-y-auto pb-4">
                <CalendarView transactions={transactions} />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="flex-1 overflow-y-auto pb-4">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <h3 className="mb-6 text-xl font-medium">설정</h3>
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

                      <Button variant="destructive" className="mt-6" onClick={handleLogout}>
                        로그아웃
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
