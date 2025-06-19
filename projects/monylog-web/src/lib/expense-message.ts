import type { Expenses } from "@/types/expenses"
import { analyzeExpenseMessage, AnalyzeExpenseMessageResponse } from "@/lib/api/llm"

export interface ParsedExpense {
  title: string;
  tags: string[];
  amount: number;
  dt: string;
  type: 'expense' | 'income';
}



export async function expenseMessageProcessing(message: string): Promise<AnalyzeExpenseMessageResponse> {
  if (!message || message.trim().length === 0) {
    return { id: "", count: 0, expenses: [] }
  }
  // AI API를 호출하여 메시지를 분석
  const aiResponse = await analyzeExpenseMessage({
    message,
    tags: ["담배", "커피", "점심", "저녁", "택시", "버스", "지하철", "월급", "용돈", "이자", "배당금"],
  })
  return aiResponse


  // 간단한 예시: 쉼표나 줄바꿈으로 구분된 여러 거래
  // const expenses: ParsedExpense[] = []

  // // 쉼표로 구분된 여러 거래 처리
  // const parts = message
  //   .split(/[,\n]/)
  //   .map((part) => part.trim())
  //   .filter((part) => part.length > 0)

  // for (const part of parts) {
  //   const parsed = parseSingleExpense(part)
  //   if (parsed) {
  //     expenses.push({
  //       ...parsed,
  //       id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  //     })
  //   }
  // }

  // // 단일 거래인 경우도 처리
  // if (expenses.length === 0) {
  //   const parsed = parseSingleExpense(message)
  //   if (parsed) {
  //     expenses.push({
  //       ...parsed,
  //       id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  //     })
  //   }
  // }

}



export function parseExpense(message: string): Expenses | null {
  // 기본 패턴: [설명] [금액]
  const parts = message.trim().split(/\s+/)

  if (parts.length < 2) {
    return null
  }

  // 마지막 부분을 금액으로 가정
  const amountStr = parts[parts.length - 1].replace(/,/g, "")
  const amount = Number.parseFloat(amountStr)

  if (isNaN(amount)) {
    return null
  }

  // 설명은 금액을 제외한 나머지
  const description = parts.slice(0, parts.length - 1).join(" ")

  // 간단한 카테고리 매핑 (임시, 나중에 AI API로 대체)
  const tagMap: Record<string, string> = {
    담배: "생활용품",
    커피: "식비",
    점심: "식비",
    저녁: "식비",
    택시: "교통",
    버스: "교통",
    지하철: "교통",
    월급: "급여",
    용돈: "기타수입",
    이자: "기타수입",
    배당금: "기타수입",
  }

  // 카테고리 결정
  let tag = "기타"
  for (const [keyword, t] of Object.entries(tagMap)) {
    if (description.includes(keyword)) {
      tag = t
      break
    }
  }

  // 수입/지출 결정
  const type = ["월급", "용돈", "이자", "배당금"].some((keyword) => description.includes(keyword))
    ? "income"
    : "expense"

  return {
    id: Date.now(),
    title: description,
    amount,
    dt: new Date().toISOString(),
    type: 'expense',
    tags: [], // 기본값으로 빈 배열 추가
  }
}
