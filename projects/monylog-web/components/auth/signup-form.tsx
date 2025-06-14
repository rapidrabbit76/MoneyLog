"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github, ArrowLeft } from "lucide-react"
import { loginWithGoogle, loginWithGithub } from "@/lib/auth"

interface SignupFormProps {
  onBackToLogin: () => void
}

export function SignupForm({ onBackToLogin }: SignupFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // 유효성 검사
    if (!formData.name.trim()) {
      setError("이름을 입력해주세요.")
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError("이메일을 입력해주세요.")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      setIsLoading(false)
      return
    }

    try {
      // 실제로는 회원가입 API 호출
      // 여기서는 모킹으로 처리
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 회원가입 성공 후 자동 로그인 (모킹)
      const session = {
        user: {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          image: null,
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      localStorage.setItem("finance-chat-session", JSON.stringify(session))

      // 인증 상태 변경 이벤트 발생
      window.dispatchEvent(new Event("auth-change"))
      router.push("/")
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError(null)
    setIsLoading(true)

    try {
      await loginWithGoogle()
      // 인증 상태 변경 이벤트 발생
      window.dispatchEvent(new Event("auth-change"))
      router.push("/")
    } catch (err) {
      setError("Google 회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignup = async () => {
    setError(null)
    setIsLoading(true)

    try {
      await loginWithGithub()
      // 인증 상태 변경 이벤트 발생
      window.dispatchEvent(new Event("auth-change"))
      router.push("/")
    } catch (err) {
      setError("GitHub 회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={onBackToLogin} className="p-0 h-auto">
          <ArrowLeft className="h-4 w-4 mr-1" />
          로그인으로 돌아가기
        </Button>
      </div>

      <div className="flex flex-col space-y-4">
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 border-primary/20 bg-background py-6 hover:bg-primary/5"
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            style={{ fill: "currentcolor" }}
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google로 회원가입
        </Button>

        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 border-primary/20 bg-background py-6 hover:bg-primary/5"
          onClick={handleGithubSignup}
          disabled={isLoading}
        >
          <Github className="h-5 w-5" />
          GitHub로 회원가입
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는 이메일로 회원가입</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="6자 이상 입력하세요"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full py-6" disabled={isLoading}>
            {isLoading ? "회원가입 중..." : "회원가입"}
          </Button>
        </form>

        <div className="text-center text-sm">
          이미 계정이 있으신가요?{" "}
          <button onClick={onBackToLogin} className="text-primary hover:underline">
            로그인
          </button>
        </div>
      </div>
    </div>
  )
}
