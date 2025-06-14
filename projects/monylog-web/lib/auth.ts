"use client"

import type { User, Session } from "@/types/auth"

// 세션 쿠키 이름
const SESSION_COOKIE_NAME = "finance-chat-session"

// 테스트 사용자 데이터
const TEST_USER: User = {
  id: "1",
  name: "이용수",
  email: "yslee.dev@gmail.com",
  image: null,
}

// 이메일/비밀번호 로그인 (모킹)
export async function loginWithEmail(email: string, password: string): Promise<User> {
  // 모킹된 API 호출 시뮬레이션
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 테스트 계정 확인
      if (email === "yslee.dev@gmail.com" && password === "1q2w3e4r") {
        // 세션 생성
        const session: Session = {
          user: TEST_USER,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후 만료
        }

        // 세션 저장
        localStorage.setItem(SESSION_COOKIE_NAME, JSON.stringify(session))

        resolve(TEST_USER)
      } else {
        reject(new Error("Invalid credentials"))
      }
    }, 500) // 0.5초 지연으로 API 호출 시뮬레이션
  })
}

// Google 로그인 (모킹)
export async function loginWithGoogle(): Promise<User> {
  // 모킹된 API 호출 시뮬레이션
  return new Promise((resolve) => {
    setTimeout(() => {
      // 세션 생성
      const session: Session = {
        user: TEST_USER,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      // 세션 저장
      localStorage.setItem(SESSION_COOKIE_NAME, JSON.stringify(session))

      resolve(TEST_USER)
    }, 800) // 0.8초 지연으로 API 호출 시뮬레이션
  })
}

// GitHub 로그인 (모킹)
export async function loginWithGithub(): Promise<User> {
  // 모킹된 API 호출 시뮬레이션
  return new Promise((resolve) => {
    setTimeout(() => {
      // 세션 생성
      const session: Session = {
        user: TEST_USER,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      // 세션 저장
      localStorage.setItem(SESSION_COOKIE_NAME, JSON.stringify(session))

      resolve(TEST_USER)
    }, 800) // 0.8초 지연으로 API 호출 시뮬레이션
  })
}

// 로그아웃 (모킹)
export async function logout(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem(SESSION_COOKIE_NAME)
      resolve()
    }, 300) // 0.3초 지연으로 API 호출 시뮬레이션
  })
}

// 현재 세션 가져오기
export function getSession(): Session | null {
  if (typeof window === "undefined") return null

  try {
    const sessionData = localStorage.getItem(SESSION_COOKIE_NAME)
    if (!sessionData) return null

    const session: Session = JSON.parse(sessionData)

    // 세션 만료 확인
    if (new Date(session.expires) < new Date()) {
      localStorage.removeItem(SESSION_COOKIE_NAME)
      return null
    }

    return session
  } catch (error) {
    console.error("Failed to parse session", error)
    return null
  }
}

// 현재 사용자 가져오기
export function getCurrentUser(): User | null {
  const session = getSession()
  return session?.user || null
}
