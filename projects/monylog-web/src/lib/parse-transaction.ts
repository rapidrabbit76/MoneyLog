import type { Transaction } from "@/types/transaction"

export interface ParsedTransaction {
  id: string
  description: string
  amount: number
  category: string
  type: "income" | "expense"
}

export function parseTransactionInput(message: string): ParsedTransaction[] {
  // 여러 거래를 파싱하는 로직 (예시)
  // 실제로는 AI API에서 복수개의 거래를 반환할 예정

  // 간단한 예시: 쉼표나 줄바꿈으로 구분된 여러 거래
  const transactions: ParsedTransaction[] = []

  // 쉼표로 구분된 여러 거래 처리
  const parts = message
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  for (const part of parts) {
    const parsed = parseSingleTransaction(part)
    if (parsed) {
      transactions.push({
        ...parsed,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })
    }
  }

  // 단일 거래인 경우도 처리
  if (transactions.length === 0) {
    const parsed = parseSingleTransaction(message)
    if (parsed) {
      transactions.push({
        ...parsed,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })
    }
  }

  return transactions
}

function parseSingleTransaction(message: string): Omit<ParsedTransaction, "id"> | null {
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

  // 기본값으로 설정 (AI API에서 나중에 분류할 예정)
  const category = "기타"
  const type = "expense" // 기본값은 지출

  return {
    description,
    amount,
    category,
    type,
  }
}

export function createTransactionFromParsed(parsed: ParsedTransaction): Transaction {
  return {
    description: parsed.description,
    amount: parsed.amount,
    date: new Date().toISOString(),
    category: parsed.category,
    type: parsed.type,
  }
}

export function parseTransaction(message: string): Transaction | null {
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
  const categoryMap: Record<string, string> = {
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
  let category = "기타"
  for (const [keyword, cat] of Object.entries(categoryMap)) {
    if (description.includes(keyword)) {
      category = cat
      break
    }
  }

  // 수입/지출 결정
  const type = ["월급", "용돈", "이자", "배당금"].some((keyword) => description.includes(keyword))
    ? "income"
    : "expense"

  return {
    description,
    amount,
    date: new Date().toISOString(),
    category,
    type,
  }
}
