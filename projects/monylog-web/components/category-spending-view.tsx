"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingDown, TrendingUp, Minus } from "lucide-react"
import type { Transaction } from "@/types/transaction"
import { formatCurrency } from "@/lib/format-currency"
import { useCategories } from "@/hooks/use-categories"

interface CategorySpendingViewProps {
  transactions: Transaction[]
}

type Period = "week" | "month" | "quarter" | "year"

interface CategorySummary {
  category: string
  totalAmount: number
  transactionCount: number
  percentage: number
  trend: "up" | "down" | "same"
  trendPercentage: number
}

export function CategorySpendingView({ transactions }: CategorySpendingViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month")
  const { categories } = useCategories()

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

  const getPreviousDateRange = (period: Period) => {
    const { start, end } = getDateRange(period)
    const duration = end.getTime() - start.getTime()

    const prevEnd = new Date(start.getTime() - 1)
    const prevStart = new Date(prevEnd.getTime() - duration)

    return { start: prevStart, end: prevEnd }
  }

  const categoryData = useMemo(() => {
    const { start, end } = getDateRange(selectedPeriod)
    const { start: prevStart, end: prevEnd } = getPreviousDateRange(selectedPeriod)

    // 현재 기간 거래
    const currentTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date >= start && date <= end && t.type === "expense"
    })

    // 이전 기간 거래
    const previousTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date >= prevStart && date <= prevEnd && t.type === "expense"
    })

    // 카테고리별 집계
    const categoryMap = new Map<string, CategorySummary>()
    const prevCategoryMap = new Map<string, number>()

    // 이전 기간 데이터
    previousTransactions.forEach((transaction) => {
      const current = prevCategoryMap.get(transaction.category) || 0
      prevCategoryMap.set(transaction.category, current + transaction.amount)
    })

    // 현재 기간 데이터
    currentTransactions.forEach((transaction) => {
      const current = categoryMap.get(transaction.category)
      if (current) {
        current.totalAmount += transaction.amount
        current.transactionCount += 1
      } else {
        categoryMap.set(transaction.category, {
          category: transaction.category,
          totalAmount: transaction.amount,
          transactionCount: 1,
          percentage: 0,
          trend: "same",
          trendPercentage: 0,
        })
      }
    })

    // 총 지출 계산
    const totalSpending = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.totalAmount, 0)

    // 퍼센티지 및 트렌드 계산
    const result: CategorySummary[] = Array.from(categoryMap.values()).map((cat) => {
      const percentage = totalSpending > 0 ? (cat.totalAmount / totalSpending) * 100 : 0
      const prevAmount = prevCategoryMap.get(cat.category) || 0

      let trend: "up" | "down" | "same" = "same"
      let trendPercentage = 0

      if (prevAmount > 0) {
        const change = ((cat.totalAmount - prevAmount) / prevAmount) * 100
        trendPercentage = Math.abs(change)

        if (change > 5) trend = "up"
        else if (change < -5) trend = "down"
        else trend = "same"
      } else if (cat.totalAmount > 0) {
        trend = "up"
        trendPercentage = 100
      }

      return {
        ...cat,
        percentage,
        trend,
        trendPercentage,
      }
    })

    // 금액 순으로 정렬
    return result.sort((a, b) => b.totalAmount - a.totalAmount)
  }, [transactions, selectedPeriod])

  const totalSpending = categoryData.reduce((sum, cat) => sum + cat.totalAmount, 0)

  const getTrendIcon = (trend: "up" | "down" | "same") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-red-500" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-green-500" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend: "up" | "down" | "same") => {
    switch (trend) {
      case "up":
        return "text-red-500"
      case "down":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            카테고리별 지출
          </CardTitle>
        </div>
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
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center pb-2 border-b">
          <div className="text-xs text-muted-foreground">{periodLabels[selectedPeriod]} 총 지출</div>
          <div className="text-lg font-bold text-red-500 dark:text-red-400">{formatCurrency(totalSpending)}</div>
        </div>

        {categoryData.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">{periodLabels[selectedPeriod]} 지출 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {categoryData.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      {cat.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(cat.trend)}
                      {cat.trend !== "same" && (
                        <span className={`text-xs ${getTrendColor(cat.trend)}`}>{cat.trendPercentage.toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">{formatCurrency(cat.totalAmount)}</div>
                    <div className="text-xs text-muted-foreground">{cat.transactionCount}건</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>전체의 {cat.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={cat.percentage} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {categoryData.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground text-center">💡 이전 기간 대비 증감률을 표시합니다</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
