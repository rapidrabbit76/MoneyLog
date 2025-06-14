"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Dashboard from "@/components/dashboard"
import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Transaction } from "@/types/transaction"
import { parseTransaction } from "@/lib/parse-transaction"
import { useEffect } from "react"

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("main")
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

  const updateSidebarState = (width: number) => {
    setSidebarWidth(width)
    setSidebarCollapsed(width < 180)
  }

  const toggleSidebar = () => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
      // 사이드바를 다시 열 때 이전 너비 복원
      updateSidebarState(sidebarWidth)
    }
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

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

  if (loading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>
  }

  if (!isAuthenticated) {
    return null // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  return (
    <Dashboard
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      sidebarWidth={sidebarWidth}
      setSidebarWidth={setSidebarWidth}
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      transactions={transactions}
      setTransactions={setTransactions}
      isResizing={isResizing}
      setIsResizing={setIsResizing}
      handleChatSubmit={handleChatSubmit}
      handleMouseDown={handleMouseDown}
      updateSidebarState={updateSidebarState}
      toggleSidebar={toggleSidebar}
    />
  )
}
