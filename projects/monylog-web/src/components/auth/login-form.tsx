"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github } from "lucide-react"
import { loginWithGoogle, loginWithGithub } from "@/lib/auth"
import { loginWithEmail } from "@/lib/api/auth"
import { useUserStore } from '@/store/user-store';

interface LoginFormProps {
  onSignupClick: () => void
}

export function LoginForm({ onSignupClick }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fetchUser = useUserStore((state) => state.fetchUser);
  const user = useUserStore((state) => state.user);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await loginWithEmail({ email, password });
      await fetchUser();
      if (user) {
        router.push("/");
      }
    } catch (err) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => { }

  const handleGithubLogin = async () => { }

  return (
    <div className="mt-8">
      <div className="flex flex-col space-y-4">
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 border-primary/20 bg-background py-6 hover:bg-primary/5"
          onClick={handleGoogleLogin}
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
          Google로 로그인
        </Button>

        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 border-primary/20 bg-background py-6 hover:bg-primary/5"
          onClick={handleGithubLogin}
          disabled={isLoading}
        >
          <Github className="h-5 w-5" />
          GitHub로 로그인
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는 이메일로 로그인</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">비밀번호</Label>
              <a href="#" className="text-xs text-primary hover:underline">
                비밀번호 찾기
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <div className="text-center text-sm">
          계정이 없으신가요?{" "}
          <button onClick={onSignupClick} className="text-primary hover:underline">
            회원가입
          </button>
        </div>
      </div>
    </div>
  )
}
