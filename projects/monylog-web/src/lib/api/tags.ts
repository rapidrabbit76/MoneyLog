import { User } from "@/types/auth";
import { ParsedExpense } from "../expense-message";
import { Expenses } from "@/types/expenses";
import { fetchWithAuthRetry } from "./auth";
import { toast } from "@/hooks/use-toast";

// 태그 타입 정의 (API 문서 기반)
export interface ExpenseTag {
  id: string;
  name: string;
}

// 태그 생성 요청 타입 정의
export interface CreateExpenseTagRequest {
  name: string;
}


// API 기본 URL 설정
const BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:8080" : "";


// 태그 목록 조회
export const getTags = async (): Promise<ExpenseTag[]> => {
  try {
    const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/expenses/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("태그 목록 조회 실패");
    const res = await response.json();
    return res.data as ExpenseTag[];
  } catch (error) {
    toast({
      title: "태그 목록 불러오기 실패",
      description: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다.",
      variant: "destructive",
    });
    return [];
  }
};

// 태그 생성
export const createTag = async (payload: CreateExpenseTagRequest): Promise<void> => {
  try {
    const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/expenses/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("태그 생성 실패");
  } catch (error) {
    toast({
      title: "태그 생성 실패",
      description: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다.",
      variant: "destructive",
    });
  }
};

// 태그 수정
export const updateTag = async (id: string, payload: { name: string }): Promise<ExpenseTag | null> => {
  try {
    const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/expenses/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("태그 수정 실패");
    const res = await response.json();
    return res.data as ExpenseTag;
  } catch (error) {
    toast({
      title: "태그 수정 실패",
      description: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다.",
      variant: "destructive",
    });
    return null;
  }
};

// 태그 삭제 (id 배열 전달)
export const deleteTag = async (id: string): Promise<boolean> => {
  //  id is query parameter로 전달해야ㅓ
  const queryParams = new URLSearchParams({
    id
  }).toString();
  try {
    const response = await fetchWithAuthRetry(`${BASE_URL}/api/v1/expenses/tags?${queryParams}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("태그 삭제 실패");
    return true;
  } catch (error) {
    toast({
      title: "태그 삭제 실패",
      description: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다.",
      variant: "destructive",
    });
    return false;
  }
};
