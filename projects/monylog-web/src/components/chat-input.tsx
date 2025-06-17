"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TransactionConfirmationStack } from "@/components/transaction-confirmation-stack"
import { expenseMessageProcessing, type ParsedExpense } from "@/lib/parse-transaction"

import { AnalyzeExpenseMessageResponse } from "@/lib/api/llm"

interface ChatInputProps {
  onSubmit: (message: string) => void
}

export function ChatInput({ onSubmit }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [pendingExpense, setPendingExpense] = useState<AnalyzeExpenseMessageResponse>(
    { id: "", count: 0, expenses: [] }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      const parsed = await expenseMessageProcessing(message)
      if (parsed.count > 0) {
        setPendingExpense(parsed)
        setMessage("")
      } else {
        alert("입력 형식이 올바르지 않습니다. 예: '담배 4800' 또는 '커피 3000, 점심 8000'")
      }
    }
  }

  const handleConfirm = (confirmedTransactions: ParsedExpense[]) => {
    // 확인된 거래들을 개별적으로 처리
    confirmedTransactions.forEach((transaction) => {
      // const transactionData = createTransactionFromParsed(transaction)
      // onSubmit(JSON.stringify(transactionData))
      console.log("Confirmed transaction:", transaction)
    })
    setPendingExpense({ id: "", count: 0, expenses: [] })
  }

  const handleCancel = () => {
    setPendingExpense({ id: "", count: 0, expenses: [] })
  }

  if (pendingExpense.count > 0) {
    return (
      <div className="space-y-4">
        <TransactionConfirmationStack
          expenses={pendingExpense.expenses}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="예: 담배 4800, 커피 3000, 점심 8000"
          className="flex-1 h-12 rounded-full border-primary/20 focus-visible:ring-primary"
        />
        <Button type="submit" size="icon" className="h-12 w-12 rounded-full">
          <Send className="h-5 w-5" />
          <span className="sr-only">전송</span>
        </Button>
      </form>

      <div className="text-xs text-muted-foreground text-center">
        💡 여러 거래를 한 번에 입력하려면 쉼표로 구분하세요. 예: "커피 3000, 점심 8000, 택시 5000"
      </div>
    </div>
  )
}
