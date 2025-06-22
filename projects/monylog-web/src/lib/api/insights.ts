import { User } from "@/types/auth";
import { ParsedExpense } from "../expense-message";
import { Expenses } from "@/types/expenses";
import { fetchWithAuthRetry } from "./auth";
import { toast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/api/response";


// 태그 생성 요청 타입 정의
export interface SummaryRequestQuery {
  startDate: string;
  endDate: string;
  tag?: string;
}


export interface SummaryTimeseriesEntry {
  date: string;
  amount: {
    expense: string | number;
    income: string | number;
    total: string | number;
  }
  count: {
    expense: number;
    income: number;
    total: number;
  }
}

export interface SummaryResponseData {
  amount: {
    expense: string | number;
    income: string | number;
    total: string | number;
  }
  count: {
    expense: number;
    income: number;
    total: number;
  }

  timeseries: SummaryTimeseriesEntry[];
  startDate?: string;
  endDate?: string;
}


// API 기본 URL 설정
const BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:8080" : "";



/**
 * Fetches the summary insights for the given period and tag.
 * @param query - The summary request query parameters.
 * @returns ApiResponse<SummaryResponseData>
 */
export async function getSummaryInsights(query: SummaryRequestQuery): Promise<SummaryResponseData> {
  const params = new URLSearchParams({ ...query }).toString();
  const url = `${BASE_URL}/api/v1/insights/summary?${params}`;
  try {
    const response = await fetchWithAuthRetry(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const res: ApiResponse<SummaryResponseData> = await response.json();
    return res.data;
  } catch (error) {
    toast({
      title: "요약 정보 불러오기 실패",
      description: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다.",
      variant: "destructive",
    });
    throw error;
  }
}
