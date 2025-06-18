"use client"

import type React from "react"

import { useContext, useState } from "react"
import { Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ExpensesConfirmationStack } from "@/components/expenses-confirmation-stack"
import { expenseMessageProcessing, type ParsedExpense } from "@/lib/expense-message"
import LoadingPopup from "./loading-popup"

import { AnalyzeExpenseMessageResponse } from "@/lib/api/llm"
import { createExpenses } from "@/lib/api/expenses"
import { ExpensesContext } from "@/contexts/expenses-context"

interface ChatInputProps {
  onSubmit: () => void
}

export function ChatInput({ onSubmit }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [pendingExpense, setPendingExpense] = useState<AnalyzeExpenseMessageResponse>(
    { id: "", count: 0, expenses: [] }
  )

  const expenseContext = useContext(ExpensesContext)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim()) return

    const currentInput = message
    setMessage("")

    setIsLoading(true)
    try {
      const parsed = await expenseMessageProcessing(currentInput)
      if (parsed.count > 0) {
        setPendingExpense(parsed)
      } else {
        alert("입력 형식이 올바르지 않습니다. 예: '담배 4800' 또는 '커피 3000, 점심 8000'")
      }
    } catch (error) {
      console.error("Error processing message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = (confirmedTransactions: ParsedExpense[]) => {
    confirmedTransactions.forEach((transaction) => {
      console.log("Confirmed transaction:", transaction)
    })
    //  call create Expense API
    createExpenses({
      requestId: pendingExpense.id,
      expenses: confirmedTransactions,
    })
      .then(() => {
        console.log("Expenses created successfully")
        expenseContext?.refreshExpenses?.()
      })
      .catch((error) => {
        console.error("Error creating expenses:", error)
        alert("지출 내역을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.")
      })
      .finally(() => {
        setIsLoading(false)
        setPendingExpense({ id: "", count: 0, expenses: [] })
        onSubmit()
      })
  }

  const handleCancel = () => {
    setPendingExpense({ id: "", count: 0, expenses: [] })
  }

  if (pendingExpense.count > 0) {
    return (
      <div className="space-y-4">
        <ExpensesConfirmationStack
          expenses={pendingExpense.expenses}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <>
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

      <LoadingPopup isOpen={isLoading} />
    </>
  )
}
