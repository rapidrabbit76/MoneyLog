import { User } from "@/types/auth";
import { toast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/user-store";
import { redirect } from "next/dist/server/api-utils";

interface LoginRequest {
  email: string;
  password: string;
}

// API 기본 URL 설정
const BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:8080" : "";

// 공통 fetch 래퍼: 403 발생 시 refreshToken 후 1회 재시도
async function fetchWithAuthRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retry = true,
): Promise<Response> {
  let response = await fetch(input, { ...init, credentials: "include" });
  // 401(Unauthorized) 또는 403(Forbidden) 발생 시 refresh 시도
  if ([401, 403].includes(response.status) && retry) {
    try {
      await refreshToken();
      response = await fetch(input, { ...init, credentials: "include" });
    } catch (e) {
      // refreshToken 실패 시 자동 로그아웃 및 안내
      toast({
        title: "세션 만료",
        description: "세션이 만료되었습니다. 다시 로그인 해주세요.",
        variant: "destructive",
      });
      if (typeof window !== "undefined") {
        // zustand store 직접 접근하여 로그아웃
        const { logout } =
          require("@/store/user-store").useUserStore.getState();
        if (logout) await logout();
      }
      throw new Error("세션이 만료되었습니다. 다시 로그인 해주세요.");
    }
  }
  return response;
}

export const loginWithEmail = async (
  credentials: LoginRequest,
): Promise<void> => {
  try {
    const formData = new URLSearchParams();
    formData.append("email", credentials.email);
    formData.append("password", credentials.password);
    const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    if (!response.ok) {
      const error = await response.json();
      toast({
        title: "로그인 실패",
        description: error.message || "로그인에 실패했습니다.",
        variant: "destructive",
      });
      throw new Error(error.message || "로그인에 실패했습니다.");
    }
  } catch (error) {
    toast({
      title: "로그인 실패",
      description:
        error instanceof Error
          ? error.message
          : "알 수 없는 에러가 발생했습니다.",
      variant: "destructive",
    });
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "로그인에 실패했습니다.");
    }
    const res = await response.json();
    const user = res.data;
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("알 수 없는 에러가 발생했습니다.");
  }
};

export const logout = async (): Promise<void> => {
  try {
    const response = await fetchWithAuthRetry(
      `${BASE_URL}/api/v1/auth/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "로그아웃에 실패했습니다.");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("알 수 없는 에러가 발생했습니다.");
  }
};

export const refreshToken = async (): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "토큰 갱신에 실패했습니다.");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("알 수 없는 에러가 발생했습니다.");
  }
};

export { fetchWithAuthRetry };

// 팝업 기반 OAuth 유틸리티 함수들
interface OAuthPopupResult {
  success: boolean;
  error?: string;
}

// 팝업 창을 열고 OAuth 인증을 처리하는 함수
export const openOAuthPopup = (url: string, provider: string): Promise<OAuthPopupResult> => {
  return new Promise((resolve) => {
    // 팝업 창 크기 및 위치 계산
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // 팝업 창 열기
    const popup = window.open(
      url,
      `${provider}_oauth`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      resolve({
        success: false,
        error: "팝업이 차단되었습니다. 브라우저의 팝업 차단을 해제해주세요."
      });
      return;
    }

    // 팝업에서 메시지를 받는 이벤트 리스너
    const handleMessage = (event: MessageEvent) => {
      // 보안을 위해 origin 검증 (프로덕션에서는 실제 도메인으로 변경)
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:8080',
        window.location.origin
      ];

      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      if (event.data?.type === 'OAUTH_SUCCESS') {
        cleanup();
        resolve({ success: true });
      } else if (event.data?.type === 'OAUTH_ERROR') {
        cleanup();
        resolve({
          success: false,
          error: event.data.message || 'OAuth 인증에 실패했습니다.'
        });
      }
    };

    // 팝업이 닫혔는지 확인하는 인터벌
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        cleanup();
        resolve({
          success: false,
          error: '인증이 취소되었습니다.'
        });
      }
    }, 1000);

    // 정리 함수
    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(checkClosed);
      if (!popup.closed) {
        popup.close();
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('message', handleMessage);

    // 30초 후 타임아웃
    setTimeout(() => {
      if (!popup.closed) {
        cleanup();
        resolve({
          success: false,
          error: '인증 시간이 초과되었습니다.'
        });
      }
    }, 30000);
  });
};

// 팝업 기반 OAuth 로그인 함수 (팝업 차단 시 리다이렉트로 fallback)
export const oauthLoginPopup = async (provider: "google" | "github"): Promise<void> => {
  try {
    // 백엔드에서 OAuth URL 가져오기
    const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/oauth/login/${provider}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      toast({
        title: `${provider} 로그인 실패`,
        description: error.message || `${provider} 로그인 실패`,
        variant: "destructive",
      });
      throw new Error(error.message || `${provider} 로그인 실패`);
    }

    const res = await response.json();
    const authUrl = res.data.redirectUri;

    // 팝업으로 OAuth 인증 진행
    const result = await openOAuthPopup(authUrl, provider);

    if (result.success) {
      toast({
        title: `${provider} 로그인 성공`,
        description: "성공적으로 로그인되었습니다.",
      });
    } else if (result.error?.includes("팝업이 차단")) {
      // 팝업이 차단된 경우 사용자에게 선택권 제공
      const useRedirect = confirm(
        "팝업이 차단되었습니다. 현재 페이지에서 로그인하시겠습니까?\n" +
        "확인: 현재 페이지에서 로그인\n" +
        "취소: 팝업 차단 해제 후 다시 시도"
      );

      if (useRedirect && typeof window !== "undefined") {
        window.location.href = authUrl;
        return;
      } else {
        throw new Error("팝업 차단으로 인해 로그인이 취소되었습니다.");
      }
    } else {
      toast({
        title: `${provider} 로그인 실패`,
        description: result.error || `${provider} 로그인에 실패했습니다.`,
        variant: "destructive",
      });
      throw new Error(result.error || `${provider} 로그인에 실패했습니다.`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    toast({
      title: `${provider} 로그인 실패`,
      description: `${provider} 로그인에 실패했습니다.`,
      variant: "destructive",
    });
    throw new Error(`${provider} 로그인에 실패했습니다.`);
  }
};

export const oauthLogin = async (provider: "google" | "github"): Promise<{
  redirectUri: string;
  provider: string;
}> => {
  try {
    // 백엔드에서 OAuth URL 가져오기
    const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/oauth/login/${provider}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      toast({
        title: `${provider} 로그인 실패`,
        description: error.message || `${provider} 로그인 실패`,
        variant: "destructive",
      });
      throw new Error(error.message || `${provider} 로그인 실패`);
    }

    const res = await response.json();
    return { ...res.data }

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    toast({
      title: `${provider} 로그인 실패`,
      description: `${provider} 로그인에 실패했습니다.`,
      variant: "destructive",
    });
    throw new Error(`${provider} 로그인에 실패했습니다.`);
  }
}


export const oauthLoginCallback = async ({ provider, code, state }: {
  provider: string;
  code: string;
  state: string;
}): Promise<boolean> => {

  const queryParams = new URLSearchParams({ code, state }).toString();

  const response = await fetch(
    `${BASE_URL}/api/v1/oauth/login/${provider}/callback?${queryParams}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  )
  if (!response.ok) {
    const error = await response.json();
    toast({
      title: `${provider} 로그인 실패`,
      description: error.message || `${provider} 로그인 실패`,
      variant: "destructive",
    });
    throw new Error(error.message || `${provider} 로그인 실패`);
    return false
  }
  return true
};