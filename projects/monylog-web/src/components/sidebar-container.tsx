"use client"

import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"
import { useExpenses } from "@/hooks/use-expenses"
import React, { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useUserStore } from '@/store/user-store';

export function SidebarContainer() {
    const pathName = usePathname()
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
    const user = useUserStore((state) => state.user);

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

    if (pathName === "/login" || pathName === "/register") {
        return null // 로그인 페이지나 회원가입 페이지에서는 사이드바를 렌더링하지 않음
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
    }


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
