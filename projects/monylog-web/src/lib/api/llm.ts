interface AnalyzeExpenseMessageRequest {
    message: string;
    tags: string[];
}

export interface AnalyzeExpenseMessageResponse {
    id: string;
    count: number;
    expenses: {
        title: string;
        tags: string[];
        amount: number;
        dt: string;
        type: 'expense' | 'income';
    }[]
}

// API 기본 URL 설정
const BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : '';




export const analyzeExpenseMessage = async (body: AnalyzeExpenseMessageRequest): Promise<AnalyzeExpenseMessageResponse> => {
    try {

        const response = await fetch(`${BASE_URL}/api/v1/llm/expense`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include', // 쿠키를 주고받기 위해 필요한 설정
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '로그인에 실패했습니다.');
        }
        const res = await response.json();
        return res.data || []
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('알 수 없는 에러가 발생했습니다.');
    }
};
