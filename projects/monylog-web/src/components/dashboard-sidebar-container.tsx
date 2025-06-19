"use client"

import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"
import { useExpenses } from "@/contexts/expenses-context"
import React, { useEffect } from "react"

export function DashboardSidebarContainer() {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarWidth,
    setSidebarWidth,
    sidebarCollapsed,
    setSidebarCollapsed,
    activeTab,
    setActiveTab,
    isResizing,
    setIsResizing,
    updateSidebarState,
    toggleSidebar
  } = useSidebar()
  const { expenses } = useExpenses()

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = e.clientX
      if (newWidth >= 60 && newWidth <= 220) {
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
  }, [isResizing, updateSidebarState, setIsResizing])

  return (
    <>
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
          setActiveTab={setActiveTab}
          expenses={expenses}
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
    </>
  )
}
