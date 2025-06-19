"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { SimpleTagManager } from "@/components/simple-category-manager"
import { useRouter } from "next/navigation"
import type { User } from "@/types/auth"

interface SettingsPanelProps {
  user: User | null | undefined
  onLogout: () => void
}

export function SettingsPanel({ user, onLogout }: SettingsPanelProps) {
  const router = useRouter()
  return (
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
                <Button variant="destructive" onClick={onLogout}>로그아웃</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <SimpleTagManager />
        </div>
      </div>
    </div>
  )
}
