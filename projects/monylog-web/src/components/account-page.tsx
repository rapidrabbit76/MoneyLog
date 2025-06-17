"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Camera, Eye, EyeOff, Save, User, Shield, Upload } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

export function AccountPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 프로필 정보 상태
  const [profileData, setProfileData] = useState({
    name: user?.nickname || "",
    email: user?.email || "",
    image: user?.thumbnail || null,
  })

  // 비밀번호 변경 상태
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // UI 상태
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const initials = profileData.name
    ? profileData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 로컬 스토리지의 세션 정보 업데이트 (모킹)
      const sessionData = localStorage.getItem("finance-chat-session")
      if (sessionData) {
        const session = JSON.parse(sessionData)
        session.user = {
          ...session.user,
          name: profileData.name,
          email: profileData.email,
          image: profileData.image,
        }
        localStorage.setItem("finance-chat-session", JSON.stringify(session))
        window.dispatchEvent(new Event("auth-change"))
      }

      setMessage({ type: "success", text: "프로필이 성공적으로 업데이트되었습니다." })
    } catch (error) {
      setMessage({ type: "error", text: "프로필 업데이트 중 오류가 발생했습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "새 비밀번호가 일치하지 않습니다." })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "비밀번호는 6자 이상이어야 합니다." })
      return
    }

    setIsLoading(true)

    try {
      // 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage({ type: "success", text: "비밀번호가 성공적으로 변경되었습니다." })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      setMessage({ type: "error", text: "비밀번호 변경 중 오류가 발생했습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 실제로는 이미지를 서버에 업로드하고 URL을 받아야 함
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setProfileData((prev) => ({ ...prev, image: imageUrl }))
        setMessage({ type: "success", text: "프로필 이미지가 업로드되었습니다." })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="flex h-16 items-center border-b bg-card px-4 shadow-sm lg:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <Logo />
          <h1 className="text-xl font-bold">계정정보 수정</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto max-w-4xl p-6 space-y-8">
        {/* 메시지 표시 */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* 프로필 정보 수정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              프로필 정보
            </CardTitle>
            <CardDescription>기본 프로필 정보를 수정할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* 프로필 이미지 */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    {profileData.image ? (
                      <AvatarImage src={profileData.image || "/placeholder.svg"} alt={profileData.name} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <Button
                    type="button"
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                    onClick={handleImageClick}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <Button type="button" variant="outline" size="sm" onClick={handleImageClick}>
                    <Upload className="h-4 w-4 mr-2" />
                    프로필 사진 변경
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG 파일만 업로드 가능합니다.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="이름을 입력하세요"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="이메일을 입력하세요"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 저장 버튼 */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "저장 중..." : "프로필 저장"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setProfileData({
                      name: user?.nickname || "",
                      email: user?.email || "",
                      image: user?.thumbnail || null,
                    })
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  초기화
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 비밀번호 변경 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              비밀번호 변경
            </CardTitle>
            <CardDescription>계정 보안을 위해 정기적으로 비밀번호를 변경하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="현재 비밀번호를 입력하세요"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                {isLoading ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 계정 삭제 */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600">위험 구역</CardTitle>
            <CardDescription>계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "정말로 계정을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.",
                  )
                ) {
                  alert("계정 삭제가 요청되었습니다.")
                  handleLogout()
                }
              }}
            >
              계정 삭제
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
