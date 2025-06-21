"use client";

import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { useExpenses } from "@/hooks/use-expenses";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

export function SidebarContainer() {
  const pathName = usePathname();
  // 사이드바 UI 상태는 context로만 관리
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
    toggleSidebar,
  } = useSidebar();
  // 도메인 데이터(지출)는 zustand store에서 관리
  const { expenses } = useExpenses();
  const [isMobile, setIsMobile] = useState(false);
  // 모바일 감지 및 상태 자동 변경
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 640;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setSidebarCollapsed]);

  if (pathName === "/login" || pathName === "/register") {
    return null; // 로그인/회원가입 페이지에서는 사이드바 미노출
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "border-r bg-card transition-all duration-300 ease-in-out",
          sidebarOpen ? "block" : "hidden w-0",
        )}
        style={{ width: sidebarOpen ? `${isMobile ? 60 : 180}px` : 0 }}
      >
        <Sidebar
          expenses={expenses}
          collapsed={sidebarCollapsed || isMobile}
          toggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      {/* Resize handle 완전 제거 */}
    </>
  );
}
