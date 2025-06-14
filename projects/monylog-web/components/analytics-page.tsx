"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Minus,
  PieChart,
  BarChart3,
} from "lucide-react"
import type { Transaction } from "@/types/transaction"
import { formatCurrency } from "@/lib/format-currency"
import { useCategories } from "@/hooks/use-categories"

interface AnalyticsPageProps {
  transactions: Transaction[]
}

type Period = "week" | "month" | "quarter" | "year"
type ViewType = "expense" | "income" | "both"

interface CategoryData {
  category: string
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

export function AnalyticsPage({ transactions }: AnalyticsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month")
  const [viewType, setViewType] = useState<ViewType>("both")
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

    // 현재 기간 거래 필터링
    const currentTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date >= start && date <= end
    })

    // 이전 기간 거래 필터링
    const previousTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date >= prevStart && date <= prevEnd
    })

    // 카테고리별 집계
    const categoryMap = new Map<string, CategoryData>()
    const prevCategoryMap = new Map<string, { expense: number; income: number }>()

    // 이전 기간 데이터
    previousTransactions.forEach((transaction) => {
      const current = prevCategoryMap.get(transaction.category) || { expense: 0, income: 0 }
      if (transaction.type === "expense") {
        current.expense += transaction.amount
      } else {
        current.income += transaction.amount
      }
      prevCategoryMap.set(transaction.category, current)
    })

    // 현재 기간 데이터
    currentTransactions.forEach((transaction) => {
      const current = categoryMap.get(transaction.category)
      if (current) {
        if (transaction.type === "expense") {
          current.expenseAmount += transaction.amount
          current.expenseCount += 1
        } else {
          current.incomeAmount += transaction.amount
          current.incomeCount += 1
        }
        current.totalCount += 1
        current.netAmount = current.incomeAmount - current.expenseAmount
      } else {
        categoryMap.set(transaction.category, {
          category: transaction.category,
          expenseAmount: transaction.type === "expense" ? transaction.amount : 0,
          incomeAmount: transaction.type === "income" ? transaction.amount : 0,
          netAmount: transaction.type === "income" ? transaction.amount : -transaction.amount,
          expenseCount: transaction.type === "expense" ? 1 : 0,
          incomeCount: transaction.type === "income" ? 1 : 0,
          totalCount: 1,
          expensePercentage: 0,
          incomePercentage: 0,
          trend: "same",
          trendPercentage: 0,
        })
      }
    })

    // 총 지출/수입 계산
    const totalExpense = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.expenseAmount, 0)
    const totalIncome = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.incomeAmount, 0)

    // 퍼센티지 및 트렌드 계산
    const result: CategoryData[] = Array.from(categoryMap.values()).map((cat) => {
      const expensePercentage = totalExpense > 0 ? (cat.expenseAmount / totalExpense) * 100 : 0
      const incomePercentage = totalIncome > 0 ? (cat.incomeAmount / totalIncome) * 100 : 0

      // 트렌드 계산
      const prevData = prevCategoryMap.get(cat.category) || { expense: 0, income: 0 }
      const prevNet = prevData.income - prevData.expense

      let trend: "up" | "down" | "same" = "same"
      let trendPercentage = 0

      if (prevNet !== 0) {
        const change = ((cat.netAmount - prevNet) / Math.abs(prevNet)) * 100
        trendPercentage = Math.abs(change)

        if (change > 10) trend = "up"
        else if (change < -10) trend = "down"
        else trend = "same"
      } else if (cat.netAmount !== 0) {
        trend = cat.netAmount > 0 ? "up" : "down"
        trendPercentage = 100
      }

      return {
        ...cat,
        expensePercentage,
        incomePercentage,
        trend,
        trendPercentage,
      }
    })

    // 정렬
    return result.sort((a, b) => {
      if (viewType === "expense") return b.expenseAmount - a.expenseAmount
      if (viewType === "income") return b.incomeAmount - a.incomeAmount
      return Math.abs(b.netAmount) - Math.abs(a.netAmount)
    })
  }, [transactions, selectedPeriod, viewType])

  const totals = useMemo(() => {
    return categoryData.reduce(
      (acc, cat) => ({
        expense: acc.expense + cat.expenseAmount,
        income: acc.income + cat.incomeAmount,
        net: acc.net + cat.netAmount,
        expenseCount: acc.expenseCount + cat.expenseCount,
        incomeCount: acc.incomeCount + cat.incomeCount,
      }),
      { expense: 0, income: 0, net: 0, expenseCount: 0, incomeCount: 0 },
    )
  }, [categoryData])

  const getNetAmountColor = (amount: number) => {
    if (amount > 0) return "text-blue-500 dark:text-blue-400"
    if (amount < 0) return "text-red-500 dark:text-red-400"
    return "text-muted-foreground"
  }

  const getNetAmountIcon = (amount: number) => {
    if (amount > 0) return <ArrowUpCircle className="h-4 w-4 text-blue-500" />
    if (amount < 0) return <ArrowDownCircle className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getTrendIcon = (trend: "up" | "down" | "same") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend: "up" | "down" | "same") => {
    switch (trend) {
      case "up":
        return "text-green-500"
      case "down":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">분석</h1>
          <p className="text-muted-foreground">카테고리별 수입과 지출을 분석해보세요</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={(value: Period) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">이번 주</SelectItem>
              <SelectItem value="month">이번 달</SelectItem>
              <SelectItem value="quarter">이번 분기</SelectItem>
              <SelectItem value="year">올해</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 요약 카드들 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 지출</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500 dark:text-red-400">{formatCurrency(totals.expense)}</div>
            <p className="text-xs text-muted-foreground">{totals.expenseCount}건의 거래</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수입</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">{formatCurrency(totals.income)}</div>
            <p className="text-xs text-muted-foreground">{totals.incomeCount}건의 거래</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">순 수지</CardTitle>
            {getNetAmountIcon(totals.net)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getNetAmountColor(totals.net)}`}>{formatCurrency(totals.net)}</div>
            <p className="text-xs text-muted-foreground">
              {periodLabels[selectedPeriod]} {totals.net >= 0 ? "흑자" : "적자"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 분석 탭 */}
      <Tabs value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="both" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            전체 분석
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            지출 분석
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            수입 분석
          </TabsTrigger>
        </TabsList>

        <TabsContent value="both" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                카테고리별 종합 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{periodLabels[selectedPeriod]} 거래 내역이 없습니다</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryData.map((cat) => (
                    <Card key={cat.category} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* 카테고리 헤더 */}
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="font-medium">
                              {cat.category}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(cat.trend)}
                              {cat.trend !== "same" && (
                                <span className={`text-sm font-medium ${getTrendColor(cat.trend)}`}>
                                  {cat.trendPercentage.toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 순 수지 */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">순 수지</span>
                            <div className="flex items-center gap-2">
                              {getNetAmountIcon(cat.netAmount)}
                              <span className={`font-bold ${getNetAmountColor(cat.netAmount)}`}>
                                {formatCurrency(cat.netAmount)}
                              </span>
                            </div>
                          </div>

                          {/* 지출 정보 */}
                          {cat.expenseAmount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">지출</span>
                              <div className="text-right">
                                <div className="text-sm font-medium text-red-500 dark:text-red-400">
                                  {formatCurrency(cat.expenseAmount)}
                                </div>
                                <div className="text-xs text-muted-foreground">{cat.expenseCount}건</div>
                              </div>
                            </div>
                          )}

                          {/* 수입 정보 */}
                          {cat.incomeAmount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">수입</span>
                              <div className="text-right">
                                <div className="text-sm font-medium text-blue-500 dark:text-blue-400">
                                  {formatCurrency(cat.incomeAmount)}
                                </div>
                                <div className="text-xs text-muted-foreground">{cat.incomeCount}건</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                지출 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.filter((cat) => cat.expenseAmount > 0).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{periodLabels[selectedPeriod]} 지출 내역이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryData
                    .filter((cat) => cat.expenseAmount > 0)
                    .map((cat) => (
                      <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{cat.category}</Badge>
                            <span className="text-sm text-muted-foreground">{cat.expenseCount}건</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-500 dark:text-red-400">
                              {formatCurrency(cat.expenseAmount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              전체의 {cat.expensePercentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <Progress value={cat.expensePercentage} className="h-2" />
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                수입 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.filter((cat) => cat.incomeAmount > 0).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{periodLabels[selectedPeriod]} 수입 내역이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryData
                    .filter((cat) => cat.incomeAmount > 0)
                    .map((cat) => (
                      <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{cat.category}</Badge>
                            <span className="text-sm text-muted-foreground">{cat.incomeCount}건</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-500 dark:text-blue-400">
                              {formatCurrency(cat.incomeAmount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              전체의 {cat.incomePercentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <Progress value={cat.incomePercentage} className="h-2" />
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
