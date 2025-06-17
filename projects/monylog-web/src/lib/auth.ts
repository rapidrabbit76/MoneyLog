"use client"

import type { User, Session } from "@/types/auth"

// 세션 쿠키 이름
const SESSION_COOKIE_NAME = "finance-chat-session"

// 테스트 사용자 데이터
const TEST_USER: User = {
  id: "1",
  nickname: "이용수",
  email: "yslee.dev@gmail.com",
  thumbnail: null,
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
