"use client";

import type { User, Session } from "@/types/auth";

// 세션 쿠키 이름
const SESSION_COOKIE_NAME = "finance-chat-session";

// 테스트 사용자 데이터
const TEST_USER: User = {
  id: "1",
  nickname: "이용수",
  email: "yslee.dev@gmail.com",
  thumbnail: null,
};

// 이메일/비밀번호 로그인 (모킹)
export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  // 테스트 계정 확인
  if (email === "yslee.dev@gmail.com" && password === "1q2w3e4r") {
    // 세션 생성
    const session: Session = {
      user: TEST_USER,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후 만료
    };

    // 세션 저장
    document.cookie = `${SESSION_COOKIE_NAME}=${JSON.stringify(session)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

    return TEST_USER;
  }

  throw new Error("Invalid credentials");
}

// Google 로그인 (모킹)
export async function loginWithGoogle(): Promise<User> {
  // 실제로는 OAuth 리다이렉션 등의 과정이 필요하지만, 여기서는 모킹
  const session: Session = {
    user: TEST_USER,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  document.cookie = `${SESSION_COOKIE_NAME}=${JSON.stringify(session)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

  return TEST_USER;
}

// GitHub 로그인 (모킹)
export async function loginWithGithub(): Promise<User> {
  // 실제로는 OAuth 리다이렉션 등의 과정이 필요하지만, 여기서는 모킹
  const session: Session = {
    user: TEST_USER,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  document.cookie = `${SESSION_COOKIE_NAME}=${JSON.stringify(session)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

  return TEST_USER;
}

// 로그아웃 (모킹)
export async function logout(): Promise<void> {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  window.location.href = "/login";
}

// 클라이언트에서 세션 가져오기
export function getClientSession(): Session | null {
  if (typeof document === "undefined") return null;

  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!cookieValue) {
    return null;
  }

  try {
    const session: Session = JSON.parse(cookieValue);

    // 세션 만료 확인
    if (new Date(session.expires) < new Date()) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}
