"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { SettingsPanel } from "@/components/settings-panel"
import { useUser } from "@/contexts/user-context"

export default function SettingsRoutePage() {
  const { isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>
  }

  if (!isAuthenticated) {
    return null // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <SettingsPanel user={user} onLogout={handleLogout} />
  )
}
