"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"; // Changed from useAuth to useUser
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"

export default function LoginPage() {
  const { user, isLoading } = useUser(); // Changed from useAuth to useUser
  const router = useRouter()
  const [isSignupMode, setIsSignupMode] = useState(false)

  useEffect(() => {
    if (!isLoading && user) { // Check isLoading and user
      router.push("/")
    }
  }, [user, isLoading, router]) // Dependency array updated

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>
  }
  
  // If user is already authenticated, don't render the login form (will be redirected)
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Left side - Login/Signup form */}
        <div className="flex w-full items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                {isSignupMode ? "가계부 챗 회원가입" : "가계부 챗에 오신 것을 환영합니다"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isSignupMode
                  ? "새 계정을 만들어 가계부 관리를 시작하세요"
                  : "채팅으로 간편하게 가계부를 작성하고 관리하세요"}
              </p>
            </div>

            {isSignupMode ? (
              <SignupForm onBackToLogin={() => setIsSignupMode(false)} />
            ) : (
              <LoginForm onSignupClick={() => setIsSignupMode(true)} />
            )}
          </div>
        </div>

        {/* Right side - Hero image and features */}
        <div className="hidden bg-primary/10 lg:block lg:w-1/2">
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <div className="mx-auto max-w-md">
              <h2 className="text-3xl font-bold text-primary">채팅으로 간편하게 관리하는 가계부</h2>
              <p className="mt-4 text-lg text-foreground/80">
                복잡한 입력 없이 채팅하듯 간편하게 수입과 지출을 기록하고 관리하세요.
              </p>

              <div className="mt-12 grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">채팅 입력</h3>
                  <p className="text-sm text-muted-foreground">"담배 4800"처럼 간단하게 입력하면 자동으로 분석합니다</p>
                </div>

                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">통계 분석</h3>
                  <p className="text-sm text-muted-foreground">수입과 지출을 자동으로 분석하여 보기 쉽게 표시합니다</p>
                </div>

                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">달력 보기</h3>
                  <p className="text-sm text-muted-foreground">달력으로 일별 수입과 지출을 한눈에 확인할 수 있습니다</p>
                </div>

                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">맞춤 설정</h3>
                  <p className="text-sm text-muted-foreground">다크 모드 등 사용자 취향에 맞게 설정할 수 있습니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
