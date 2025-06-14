"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, X, Edit, ArrowLeft, ArrowRight } from "lucide-react"
import type { ParsedTransaction } from "@/lib/parse-transaction"
import { useCategories } from "@/hooks/use-categories"

interface TransactionConfirmationStackProps {
  transactions: ParsedTransaction[]
  onConfirm: (transactions: ParsedTransaction[]) => void
  onCancel: () => void
}

export function TransactionConfirmationStack({ transactions, onConfirm, onCancel }: TransactionConfirmationStackProps) {
  const { categories } = useCategories()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [confirmedTransactions, setConfirmedTransactions] = useState<ParsedTransaction[]>([])
  const [editingTransactions, setEditingTransactions] = useState<ParsedTransaction[]>(transactions)
  const [isEditing, setIsEditing] = useState(false)

  const currentTransaction = editingTransactions[currentIndex]
  const totalTransactions = editingTransactions.length
  const progress = ((currentIndex + 1) / totalTransactions) * 100

  const handleConfirmCurrent = () => {
    const confirmed = [...confirmedTransactions, currentTransaction]
    setConfirmedTransactions(confirmed)

    if (currentIndex < editingTransactions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsEditing(false)
    } else {
      // 모든 거래 확인 완료
      onConfirm(confirmed)
    }
  }

  const handleSkipCurrent = () => {
    // 현재 거래를 제외하고 다음으로
    const updatedTransactions = editingTransactions.filter((_, index) => index !== currentIndex)
    setEditingTransactions(updatedTransactions)

    if (updatedTransactions.length === 0) {
      // 모든 거래가 제거됨
      onConfirm(confirmedTransactions)
    } else if (currentIndex >= updatedTransactions.length) {
      // 마지막 거래를 제거한 경우
      setCurrentIndex(updatedTransactions.length - 1)
    }
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    // 원래 값으로 복원
    const originalTransaction = transactions.find((t) => t.id === currentTransaction.id)
    if (originalTransaction) {
      const updatedTransactions = [...editingTransactions]
      updatedTransactions[currentIndex] = originalTransaction
      setEditingTransactions(updatedTransactions)
    }
    setIsEditing(false)
  }

  const handleTransactionChange = (field: keyof ParsedTransaction, value: any) => {
    const updatedTransactions = [...editingTransactions]
    updatedTransactions[currentIndex] = {
      ...updatedTransactions[currentIndex],
      [field]: value,
    }
    setEditingTransactions(updatedTransactions)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsEditing(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < editingTransactions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsEditing(false)
    }
  }

  if (editingTransactions.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* 진행 상황 표시 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>거래 확인 진행상황</span>
          <span>
            {currentIndex + 1} / {totalTransactions}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* 카드 스택 */}
      <div className="relative h-[400px]">
        {editingTransactions.map((transaction, index) => {
          const isActive = index === currentIndex
          const offset = index - currentIndex
          const isVisible = Math.abs(offset) <= 2

          if (!isVisible) return null

          return (
            <Card
              key={transaction.id}
              className={`absolute inset-0 border-primary/20 shadow-lg transition-all duration-300 ${
                isActive ? "z-30 scale-100" : "z-20"
              }`}
              style={{
                transform: `translateY(${offset * 8}px) translateX(${offset * 4}px) scale(${
                  isActive ? 1 : 0.95 - Math.abs(offset) * 0.05
                })`,
                opacity: isActive ? 1 : 0.7 - Math.abs(offset) * 0.2,
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  거래 내역 확인
                  {isActive && !isEditing && (
                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isActive && isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="description">설명</Label>
                      <Input
                        id="description"
                        value={currentTransaction.description}
                        onChange={(e) => handleTransactionChange("description", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">금액</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={currentTransaction.amount}
                        onChange={(e) => handleTransactionChange("amount", Number.parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">유형</Label>
                      <Select
                        value={currentTransaction.type}
                        onValueChange={(value: "income" | "expense") => handleTransactionChange("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">지출</SelectItem>
                          <SelectItem value="income">수입</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">카테고리</Label>
                      <Select
                        value={currentTransaction.category}
                        onValueChange={(value) => handleTransactionChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveEdit} className="flex-1">
                        <Check className="h-4 w-4 mr-2" />
                        저장
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        취소
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">설명:</span>
                        <span className="font-medium">{transaction.description}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">금액:</span>
                        <span
                          className={`font-bold text-lg ${
                            transaction.type === "expense"
                              ? "text-red-500 dark:text-red-400"
                              : "text-blue-500 dark:text-blue-400"
                          }`}
                        >
                          {transaction.type === "expense" ? "-" : "+"}
                          {new Intl.NumberFormat("ko-KR", {
                            style: "currency",
                            currency: "KRW",
                            maximumFractionDigits: 0,
                          }).format(transaction.amount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">유형:</span>
                        <Badge variant={transaction.type === "expense" ? "destructive" : "default"}>
                          {transaction.type === "expense" ? "지출" : "수입"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">카테고리:</span>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </div>
                    </div>

                    {isActive && (
                      <>
                        {/* 네비게이션 버튼 */}
                        {totalTransactions > 1 && (
                          <div className="flex justify-center gap-2 pt-2">
                            <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentIndex === 0}>
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleNext}
                              disabled={currentIndex === editingTransactions.length - 1}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {/* 확인/건너뛰기 버튼 */}
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleConfirmCurrent} className="flex-1">
                            <Check className="h-4 w-4 mr-2" />
                            확인
                          </Button>
                          <Button variant="outline" onClick={handleSkipCurrent} className="flex-1">
                            <X className="h-4 w-4 mr-2" />
                            건너뛰기
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 전체 취소 버튼 */}
      <div className="flex justify-center pt-4">
        <Button variant="ghost" onClick={onCancel}>
          전체 취소
        </Button>
      </div>
    </div>
  )
}
