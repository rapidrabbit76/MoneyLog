import { User } from "@/types/auth";
import { ParsedExpense } from "../expense-message";
import { Expenses } from "@/types/expenses";
import { fetchWithAuthRetry } from "./auth";
import { toast } from "@/hooks/use-toast";

interface CreateExpensesRequest {
  requestId: string;
  expenses: ParsedExpense[];
}

// API 기본 URL 설정
const BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:8080" : "";

export const createExpenses = async (
  payload: CreateExpensesRequest,
): Promise<void> => {
  try {
    const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      toast({
        title: "지출 등록 실패",
        description: error.message || "지출 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      throw new Error(error.message || "지출 등록 중 오류가 발생했습니다.");
    }
  } catch (error) {
    toast({
      title: "지출 등록 실패",
      description:
        error instanceof Error
          ? error.message
          : "알 수 없는 에러가 발생했습니다.",
      variant: "destructive",
    });
    throw error;
  }
};

interface GetExpensesQuery {
  startDate?: string; // YYYY-MM-DD 형식
  endDate?: string; // YYYY-MM-DD 형식
  page?: number;
  size?: number;
  sort?: string; // 예: "date,desc" 또는 "amount,asc"
}

export const getExpenses = async (
  query: GetExpensesQuery,
): Promise<Expenses[]> => {
  try {
    const queryStringParams: Record<string, string> = {};
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        queryStringParams[key] = String(value);
      }
    });
    const queryParams = new URLSearchParams(queryStringParams).toString();
    const response = await fetchWithAuthRetry(
      `${BASE_URL}/api/v1/expenses?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      const error = await response.json();
      toast({
        title: "지출 목록 불러오기 실패",
        description:
          error.message || "지출 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return [];
    }
    const res = await response.json();
    return res.data.items as Expenses[];
  } catch (error) {
    toast({
      title: "지출 목록 불러오기 실패",
      description:
        error instanceof Error
          ? error.message
          : "알 수 없는 에러가 발생했습니다.",
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Delete an expense by ID
 * @param id Expense ID
 */
export const deleteExpense = async (id: number): Promise<void> => {
  try {
    const response = await fetchWithAuthRetry(
      `${BASE_URL}/api/v1/expenses/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) {
      const error = await response.json();
      toast({
        title: "지출 삭제 실패",
        description: error.message || "지출 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      throw new Error(error.message || "지출 삭제 중 오류가 발생했습니다.");
    }
  } catch (error) {
    toast({
      title: "지출 삭제 실패",
      description:
        error instanceof Error
          ? error.message
          : "알 수 없는 에러가 발생했습니다.",
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Edit an expense note by ID
 * @param id Expense ID
 * @param note Note string
 * @returns Updated expense object
 */
export const editExpenseNote = async (
  id: string,
  note: string,
): Promise<Expenses | null> => {
  try {
    const response = await fetchWithAuthRetry(
      `${BASE_URL}/api/v1/expenses/${id}/note`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      toast({
        title: "지출 메모 수정 실패",
        description: error.message || "메모 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return null;
    }
    const res = await response.json();
    return res.data as Expenses;
  } catch (error) {
    toast({
      title: "지출 메모 수정 실패",
      description:
        error instanceof Error
          ? error.message
          : "알 수 없는 에러가 발생했습니다.",
      variant: "destructive",
    });
    return null;
  }
};


