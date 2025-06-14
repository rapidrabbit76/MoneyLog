"use client"

import { useState, useEffect } from "react"
import { logout as logoutFn, getCurrentUser } from "@/lib/auth"
import type { User } from "@/types/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 컴포넌트 마운트 시 사용자 정보 로드
    const loadUser = () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // 로컬 스토리지 변경 이벤트 리스너 추가
    const handleStorageChange = () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }

    window.addEventListener("storage", handleStorageChange)

    // 커스텀 이벤트 리스너 추가
    const handleAuthChange = () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }

    window.addEventListener("auth-change", handleAuthChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth-change", handleAuthChange)
    }
  }, [])

  const logout = async () => {
    await logoutFn()
    setUser(null)
    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event("auth-change"))
  }

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
  }
}
