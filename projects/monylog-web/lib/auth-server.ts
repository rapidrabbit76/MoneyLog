import { cookies } from "next/headers"
import type { User, Session } from "@/types/auth"

// 세션 쿠키 이름
const SESSION_COOKIE_NAME = "finance-chat-session"

// 서버 컴포넌트에서 세션 가져오기
export async function getSession(): Promise<Session | null> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session: Session = JSON.parse(sessionCookie.value)

    // 세션 만료 확인
    if (new Date(session.expires) < new Date()) {
      return null
    }

    return session
  } catch (error) {
    return null
  }
}

// 현재 사용자 가져오기
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user || null
}
