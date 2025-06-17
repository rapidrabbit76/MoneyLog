import { User } from "@/types/auth";

interface LoginRequest {
    email: string;
    password: string;
}

// API 기본 URL 설정
const BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : '';

export const loginWithEmail = async (credentials: LoginRequest): Promise<void> => {
    try {

        const formData = new URLSearchParams();
        formData.append('email', credentials.email);
        formData.append('password', credentials.password);

        const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
            credentials: 'include', // 쿠키를 주고받기 위해 필요한 설정
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '로그인에 실패했습니다.');
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('알 수 없는 에러가 발생했습니다.');
    }
};



export const getCurrentUser = async (): Promise<User> => {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include', // 쿠키를 주고받기 위해 필요한 설정
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
        const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include', // 쿠키를 주고받기 위해 필요한 설정
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