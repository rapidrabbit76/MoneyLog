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
import type { ParsedExpense } from "@/lib/expense-message"
import { useCategories } from "@/hooks/use-tags"

interface ExpensesConfirmationStackProps {
  expenses: {
    title: string;
    tags: string[];
    amount: number;
    dt: string;
    type: 'expense' | 'income';
  }[]
  onConfirm: (expenses: ParsedExpense[]) => void
  onCancel: () => void
}

export function ExpensesConfirmationStack({ expenses, onConfirm, onCancel }: ExpensesConfirmationStackProps) {
  const { categories: tags } = useCategories()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [confirmedExpenses, setConfirmedExpenses] = useState<ParsedExpense[]>([])
  const [editingExpenses, setEditingExpenses] = useState<{
    title: string;
    tags: string[];
    amount: number;
    dt: string;
    type: 'expense' | 'income';
  }[]>(expenses)
  const [isEditing, setIsEditing] = useState(false)

  const currentExpenses = editingExpenses[currentIndex]
  const totalExpenses = editingExpenses.length
  const progress = ((currentIndex + 1) / totalExpenses) * 100

  const handleConfirmCurrent = () => {
    const confirmed = [...confirmedExpenses, currentExpenses]
    setConfirmedExpenses(confirmed)

    if (currentIndex < editingExpenses.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsEditing(false)
    } else {
      // 모든 거래 확인 완료
      onConfirm(confirmed)
    }
  }

  const handleSkipCurrent = () => {
    // 현재 거래를 제외하고 다음으로
    const updatedExpenses = editingExpenses.filter((_, index) => index !== currentIndex)
    setEditingExpenses(updatedExpenses)

    if (updatedExpenses.length === 0) {
      // 모든 거래가 제거됨
      onConfirm(confirmedExpenses)
    } else if (currentIndex >= updatedExpenses.length) {
      // 마지막 거래를 제거한 경우
      setCurrentIndex(updatedExpenses.length - 1)
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
    const originalExpense = expenses.find((t) => t.title === currentExpenses.title)
    if (originalExpense) {
      const updatedExpenses = [...editingExpenses]
      updatedExpenses[currentIndex] = originalExpense
      setEditingExpenses(updatedExpenses)
    }
    setIsEditing(false)
  }

  const handleExpenseChange = (field: keyof ParsedExpense, value: any) => {
    const updatedExpense = [...editingExpenses]
    updatedExpense[currentIndex] = {
      ...updatedExpense[currentIndex],
      [field]: value,
    }
    setEditingExpenses(updatedExpense)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsEditing(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < editingExpenses.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsEditing(false)
    }
  }

  if (editingExpenses.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* 진행 상황 표시 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>거래 확인 진행상황</span>
          <span>
            {currentIndex + 1} / {totalExpenses}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* 카드 스택 */}
      <div className="relative h-[400px]">
        {editingExpenses.map((pendingExpense, index) => {
          const isActive = index === currentIndex
          const offset = index - currentIndex
          const isVisible = Math.abs(offset) <= 2

          if (!isVisible) return null

          return (
            <Card
              key={index}
              className={`absolute inset-0 border-primary/20 shadow-lg transition-all duration-300 ${isActive ? "z-30 scale-100" : "z-20"
                }`}
              style={{
                transform: `translateY(${offset * 8}px) translateX(${offset * 4}px) scale(${isActive ? 1 : 0.95 - Math.abs(offset) * 0.05
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
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="Title"
                        value={currentExpenses.title}
                        onChange={(e) => handleExpenseChange("title", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">금액</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={currentExpenses.amount}
                        onChange={(e) => handleExpenseChange("amount", Number.parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">유형</Label>
                      <Select
                        value={currentExpenses.type}
                        onValueChange={(value: "income" | "expense") => handleExpenseChange("type", value)}
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
                      <Label htmlFor="tag">태그</Label>
                      <Select
                        value={currentExpenses.tags.join(", ")}
                        onValueChange={(value) => handleExpenseChange("tags", value.split(", ").map(tag => tag.trim()))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="태그 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {tags.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
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
                        <span className="text-sm text-muted-foreground">제목:</span>
                        <span className="font-medium">{pendingExpense.title}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">금액:</span>
                        <span
                          className={`font-bold text-lg ${pendingExpense.type === "expense"
                            ? "text-red-500 dark:text-red-400"
                            : "text-blue-500 dark:text-blue-400"
                            }`}
                        >
                          {pendingExpense.type === "expense" ? "-" : "+"}
                          {new Intl.NumberFormat("ko-KR", {
                            style: "currency",
                            currency: "KRW",
                            maximumFractionDigits: 0,
                          }).format(pendingExpense.amount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">유형:</span>
                        <Badge variant={pendingExpense.type === "expense" ? "destructive" : "default"}>
                          {pendingExpense.type === "expense" ? "지출" : "수입"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">태그:</span>
                        <Badge variant="outline">{pendingExpense.tags}</Badge>
                      </div>
                    </div>

                    {isActive && (
                      <>
                        {/* 네비게이션 버튼 */}
                        {totalExpenses > 1 && (
                          <div className="flex justify-center gap-2 pt-2">
                            <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentIndex === 0}>
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleNext}
                              disabled={currentIndex === editingExpenses.length - 1}
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
