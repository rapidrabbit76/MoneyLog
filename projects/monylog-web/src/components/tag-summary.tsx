"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Minus, ArrowUpCircle, ArrowDownCircle, Calculator } from "lucide-react"
import type { Expenses } from "@/types/expenses"
import { formatCurrency } from "@/lib/format-currency"
import { useTags } from "@/hooks/use-tags"

interface TagSummaryProps {
  expenses: Expenses[]
}

type Period = "week" | "month" | "quarter" | "year"
type ViewType = "expense" | "income" | "both"

interface TagData {
  tag: string
  expenseAmount: number
  incomeAmount: number
  netAmount: number
  expenseCount: number
  incomeCount: number
  totalCount: number
  expensePercentage: number
  incomePercentage: number
  trend: "up" | "down" | "same"
  trendPercentage: number
}

export function TagSummary({ expenses }: TagSummaryProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month")
  const [viewType, setViewType] = useState<ViewType>("both")
  const { tags } = useTags()

  const periodLabels = {
    week: "이번 주",
    month: "이번 달",
    quarter: "이번 분기",
    year: "올해",
  }

  const getDateRange = (period: Period) => {
    const now = new Date()
    const start = new Date()

    switch (period) {
      case "week":
        start.setDate(now.getDate() - now.getDay())
        break
      case "month":
        start.setDate(1)
        break
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3)
        start.setMonth(quarter * 3, 1)
        break
      case "year":
        start.setMonth(0, 1)
        break
    }

    start.setHours(0, 0, 0, 0)
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)

    return { start, end }
  }

  const tagData = useMemo(() => {
    const { start, end } = getDateRange(selectedPeriod)

    // 현재 기간 거래 필터링
    const currentExpenses = expenses.filter((e) => {
      const date = new Date(e.dt)
      return date >= start && date <= end
    })

    // 태그별 집계
    const tagMap = new Map<string, TagData>()

    currentExpenses.forEach((expense) => {
      const tagName = expense.tags[0]?.name || "기타"
      const current = tagMap.get(tagName)
      if (current) {
        if (expense.type === "expense") {
          current.expenseAmount += expense.amount
          current.expenseCount += 1
        } else {
          current.incomeAmount += expense.amount
          current.incomeCount += 1
        }
        current.totalCount += 1
        current.netAmount = current.incomeAmount - current.expenseAmount
      } else {
        tagMap.set(tagName, {
          tag: tagName,
          expenseAmount: expense.type === "expense" ? expense.amount : 0,
          incomeAmount: expense.type === "income" ? expense.amount : 0,
          netAmount: expense.type === "income" ? expense.amount : -expense.amount,
          expenseCount: expense.type === "expense" ? 1 : 0,
          incomeCount: expense.type === "income" ? 1 : 0,
          totalCount: 1,
          expensePercentage: 0,
          incomePercentage: 0,
          trend: "same",
          trendPercentage: 0,
        })
      }
    })

    // 총 지출/수입 계산
    const totalExpense = Array.from(tagMap.values()).reduce((sum, cat) => sum + cat.expenseAmount, 0)
    const totalIncome = Array.from(tagMap.values()).reduce((sum, cat) => sum + cat.incomeAmount, 0)

    // 퍼센티지 계산
    const result: TagData[] = Array.from(tagMap.values()).map((cat) => ({
      ...cat,
      expensePercentage: totalExpense > 0 ? (cat.expenseAmount / totalExpense) * 100 : 0,
      incomePercentage: totalIncome > 0 ? (cat.incomeAmount / totalIncome) * 100 : 0,
    }))

    // 정렬 (순 금액 기준)
    return result.sort((a, b) => {
      if (viewType === "expense") return b.expenseAmount - a.expenseAmount
      if (viewType === "income") return b.incomeAmount - a.incomeAmount
      return Math.abs(b.netAmount) - Math.abs(a.netAmount)
    })
  }, [expenses, selectedPeriod, viewType])

  const totals = useMemo(() => {
    return tagData.reduce(
      (acc, cat) => ({
        expense: acc.expense + cat.expenseAmount,
        income: acc.income + cat.incomeAmount,
        net: acc.net + cat.netAmount,
        expenseCount: acc.expenseCount + cat.expenseCount,
        incomeCount: acc.incomeCount + cat.incomeCount,
      }),
      { expense: 0, income: 0, net: 0, expenseCount: 0, incomeCount: 0 },
    )
  }, [tagData])

  const getNetAmountColor = (amount: number) => {
    if (amount > 0) return "text-blue-500 dark:text-blue-400"
    if (amount < 0) return "text-red-500 dark:text-red-400"
    return "text-muted-foreground"
  }

  const getNetAmountIcon = (amount: number) => {
    if (amount > 0) return <ArrowUpCircle className="h-3 w-3 text-blue-500" />
    if (amount < 0) return <ArrowDownCircle className="h-3 w-3 text-red-500" />
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  return (
    <div className="space-y-4">
      {/* 기간 및 보기 옵션 */}
      <div className="space-y-2">
        <Select value={selectedPeriod} onValueChange={(value: Period) => setSelectedPeriod(value)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">이번 주</SelectItem>
            <SelectItem value="month">이번 달</SelectItem>
            <SelectItem value="quarter">이번 분기</SelectItem>
            <SelectItem value="year">올해</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="both" className="text-xs">
              전체
            </TabsTrigger>
            <TabsTrigger value="expense" className="text-xs">
              지출
            </TabsTrigger>
            <TabsTrigger value="income" className="text-xs">
              수입
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 요약 정보 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {periodLabels[selectedPeriod]} 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {viewType !== "income" && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">총 지출:</span>
              <div className="text-right">
                <div className="text-sm font-medium text-red-500 dark:text-red-400">
                  {formatCurrency(totals.expense)}
                </div>
                <div className="text-xs text-muted-foreground">{totals.expenseCount}건</div>
              </div>
            </div>
          )}

          {viewType !== "expense" && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">총 수입:</span>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-500 dark:text-blue-400">
                  {formatCurrency(totals.income)}
                </div>
                <div className="text-xs text-muted-foreground">{totals.incomeCount}건</div>
              </div>
            </div>
          )}

          {viewType === "both" && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-xs font-medium">순 수지:</span>
              <div className={`text-sm font-bold ${getNetAmountColor(totals.net)}`}>{formatCurrency(totals.net)}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 태그별 상세 */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {tagData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">{periodLabels[selectedPeriod]} 거래 내역이 없습니다</p>
          </div>
        ) : (
          tagData.map((cat) => (
            <Card key={cat.tag} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="space-y-2">
                  {/* 태그 헤더 */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {cat.tag}
                    </Badge>
                    {viewType === "both" && (
                      <div className="flex items-center gap-1">
                        {getNetAmountIcon(cat.netAmount)}
                        <span className={`text-xs font-medium ${getNetAmountColor(cat.netAmount)}`}>
                          {formatCurrency(cat.netAmount)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 지출 정보 */}
                  {viewType !== "income" && cat.expenseAmount > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">지출</span>
                        <div className="text-right">
                          <div className="text-xs font-medium text-red-500 dark:text-red-400">
                            {formatCurrency(cat.expenseAmount)}
                          </div>
                          <div className="text-xs text-muted-foreground">{cat.expenseCount}건</div>
                        </div>
                      </div>
                      {viewType === "expense" && <Progress value={cat.expensePercentage} className="h-1" />}
                    </div>
                  )}

                  {/* 수입 정보 */}
                  {viewType !== "expense" && cat.incomeAmount > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">수입</span>
                        <div className="text-right">
                          <div className="text-xs font-medium text-blue-500 dark:text-blue-400">
                            {formatCurrency(cat.incomeAmount)}
                          </div>
                          <div className="text-xs text-muted-foreground">{cat.incomeCount}건</div>
                        </div>
                      </div>
                      {viewType === "income" && <Progress value={cat.incomePercentage} className="h-1" />}
                    </div>
                  )}

                  {/* 비율 표시 */}
                  {viewType !== "both" && (
                    <div className="text-xs text-muted-foreground text-center">
                      전체의{" "}
                      {viewType === "expense" ? cat.expensePercentage.toFixed(1) : cat.incomePercentage.toFixed(1)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
