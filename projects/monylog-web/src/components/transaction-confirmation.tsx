"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Check, X, Edit } from "lucide-react"
import type { ParsedTransaction } from "@/lib/parse-transaction"
import { useCategories } from "@/hooks/use-categories"

interface TransactionConfirmationProps {
  parsedTransaction: ParsedTransaction
  onConfirm: (transaction: ParsedTransaction) => void
  onCancel: () => void
}

export function TransactionConfirmation({ parsedTransaction, onConfirm, onCancel }: TransactionConfirmationProps) {
  const { categories } = useCategories()
  const [isEditing, setIsEditing] = useState(false)
  const [editedTransaction, setEditedTransaction] = useState<ParsedTransaction>(parsedTransaction)

  const handleConfirm = () => {
    onConfirm(editedTransaction)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedTransaction(parsedTransaction)
    setIsEditing(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          거래 내역 확인
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Input
                id="description"
                value={editedTransaction.description}
                onChange={(e) => setEditedTransaction({ ...editedTransaction, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">금액</Label>
              <Input
                id="amount"
                type="number"
                value={editedTransaction.amount}
                onChange={(e) =>
                  setEditedTransaction({ ...editedTransaction, amount: Number.parseFloat(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">유형</Label>
              <Select
                value={editedTransaction.type}
                onValueChange={(value: "income" | "expense") =>
                  setEditedTransaction({ ...editedTransaction, type: value })
                }
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
                value={editedTransaction.category}
                onValueChange={(value) => setEditedTransaction({ ...editedTransaction, category: value })}
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
                <span className="font-medium">{editedTransaction.description}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">금액:</span>
                <span
                  className={`font-bold text-lg ${
                    editedTransaction.type === "expense"
                      ? "text-red-500 dark:text-red-400"
                      : "text-blue-500 dark:text-blue-400"
                  }`}
                >
                  {editedTransaction.type === "expense" ? "-" : "+"}
                  {new Intl.NumberFormat("ko-KR", {
                    style: "currency",
                    currency: "KRW",
                    maximumFractionDigits: 0,
                  }).format(editedTransaction.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">유형:</span>
                <Badge variant={editedTransaction.type === "expense" ? "destructive" : "default"}>
                  {editedTransaction.type === "expense" ? "지출" : "수입"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">카테고리:</span>
                <Badge variant="outline">{editedTransaction.category}</Badge>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleConfirm} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                확인
              </Button>
              <Button variant="outline" onClick={onCancel} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
