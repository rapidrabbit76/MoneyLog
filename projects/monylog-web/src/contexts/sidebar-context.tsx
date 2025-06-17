"use client"

import React, { createContext, useContext, useState, type ReactNode } from "react"

interface SidebarState {
  sidebarOpen: boolean
  sidebarWidth: number
  sidebarCollapsed: boolean
  activeTab: string
  isResizing: boolean
}

interface SidebarContextType extends SidebarState {
  setSidebarOpen: (open: boolean) => void
  setSidebarWidth: (width: number) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setActiveTab: (tab: string) => void
  setIsResizing: (resizing: boolean) => void
  updateSidebarState: (width: number) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("main")
  const [isResizing, setIsResizing] = useState(false)

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

  const contextValue: SidebarContextType = {
    sidebarOpen,
    sidebarWidth,
    sidebarCollapsed,
    activeTab,
    isResizing,
    setSidebarOpen,
    setSidebarWidth,
    setSidebarCollapsed,
    setActiveTab,
    setIsResizing,
    updateSidebarState,
    toggleSidebar
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
