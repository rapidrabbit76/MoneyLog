import { User } from "@/types/auth";
import { ParsedExpense } from "../expense-message";
import { Expenses } from "@/types/expenses";
import { fetchWithAuthRetry } from "./auth";

interface CreateExpensesRequest {
    requestId: string;
    expenses: ParsedExpense[];
}

// API 기본 URL 설정
const BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : '';



export const createExpenses = async (payload: CreateExpensesRequest): Promise<void> => {
    try {
        const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const error = await response.json();
            //  Popup Error message
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('알 수 없는 에러가 발생했습니다.');
    }
};

interface GetExpensesQuery {
    startDate?: string; // YYYY-MM-DD 형식
    endDate?: string; // YYYY-MM-DD 형식
    page?: number;
    size?: number;
    sort?: string; // 예: "date,desc" 또는 "amount,asc"

}


export const getExpenses = async (query: GetExpensesQuery): Promise<Expenses[]> => {
    try {
        const queryStringParams: Record<string, string> = {};
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined) {
                queryStringParams[key] = String(value);
            }
        });
        const queryParams = new URLSearchParams(queryStringParams).toString();
        const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/expenses?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            return [];
            // const error = await response.json();
            // throw new Error(error.message || 'Failed to fetch expenses');
        }
        const res = await response.json();
        return res.data.items as Expenses[];
    } catch (error) {
        if (error instanceof Error) {
            // throw error;
            return [];
        }
        return [];
        throw new Error('알 수 없는 에러가 발생했습니다.');
    }
}

