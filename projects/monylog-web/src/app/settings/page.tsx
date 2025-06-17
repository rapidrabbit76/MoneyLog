"use client"

import { useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Dashboard from "@/components/dashboard"
import { UserContext } from "@/contexts/user-context"

export default function SettingsPage() {
  const { isAuthenticated, loading } = useAuth()
  const context = useContext(UserContext);
  const router = useRouter()

  useEffect(() => {
    if (!context?.isLoading && !context?.user) { // Check isLoading and user
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>
  }

  if (!isAuthenticated) {
    return null // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  return <Dashboard />
}
