interface ExpenseTag {
    id: string;
    name: string;
    data: {
        "color": string;
    }
}


// API 기본 URL 설정
const BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : '';




export const getExpenseTags = async (): Promise<ExpenseTag[]> => {
    try {

        const response = await fetch(`${BASE_URL}/api/v1/tags`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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


export const createExpenseTag = async (body: { name: string; }): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/tags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...body }),
            credentials: 'include', // 쿠키를 주고받기 위해 필요한 설정
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '태그 생성에 실패했습니다.');
        }
        const res = await response.json();
        return res.data;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('알 수 없는 에러가 발생했습니다.');
    }
}

export const deleteExpenseTag = async (id: string): Promise<void> => {
    const params = new URLSearchParams({ id });
    try {
        const response = await fetch(`${BASE_URL}/api/v1/tags?${params.toString()}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // 쿠키를 주고받기 위해 필요한 설정
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '태그 삭제에 실패했습니다.');
        }
        return;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('알 수 없는 에러가 발생했습니다.');
    }
}