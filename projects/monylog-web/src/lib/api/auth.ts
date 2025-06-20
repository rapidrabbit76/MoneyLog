import { User } from "@/types/auth";
import { toast } from "@/hooks/use-toast";

interface LoginRequest {
    email: string;
    password: string;
}

// API 기본 URL 설정
const BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : '';

// 공통 fetch 래퍼: 403 발생 시 refreshToken 후 1회 재시도
async function fetchWithAuthRetry(input: RequestInfo | URL, init?: RequestInit, retry = true): Promise<Response> {
    let response = await fetch(input, { ...init, credentials: 'include' });
    if (response.status === 403 && retry) {
        try {
            await refreshToken();
            response = await fetch(input, { ...init, credentials: 'include' });
        } catch (e) {
            // refreshToken 실패 시 그대로 403 반환
        }
    }
    if (!response.ok) {
        const error = await response.json();
        toast({
            title: '요청 실패',
            description: error.message || '알 수 없는 에러가 발생했습니다.',
            variant: 'destructive',
        });
        throw new Error(error.message || '요청에 실패했습니다.');
    }
    return response;
}

export const loginWithEmail = async (credentials: LoginRequest): Promise<void> => {
    try {
        const formData = new URLSearchParams();
        formData.append('email', credentials.email);
        formData.append('password', credentials.password);
        const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });
        if (!response.ok) {
            const error = await response.json();
            toast({
                title: '로그인 실패',
                description: error.message || '로그인에 실패했습니다.',
                variant: 'destructive',
            });
            throw new Error(error.message || '로그인에 실패했습니다.');
        }
    } catch (error) {
        toast({
            title: '로그인 실패',
            description: error instanceof Error ? error.message : '알 수 없는 에러가 발생했습니다.',
            variant: 'destructive',
        });
        throw error;
    }
};

export const getCurrentUser = async (): Promise<User> => {
    try {
        const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '로그인에 실패했습니다.');
        }
        const res = await response.json();
        const user = res.data;
        return user;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('알 수 없는 에러가 발생했습니다.');
    }
}

export const logout = async (): Promise<void> => {
    try {
        const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '로그아웃에 실패했습니다.');
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('알 수 없는 에러가 발생했습니다.');
    }
};

export const refreshToken = async (): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '토큰 갱신에 실패했습니다.');
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('알 수 없는 에러가 발생했습니다.');
    }
}

export { fetchWithAuthRetry };