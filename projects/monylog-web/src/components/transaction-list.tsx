"use client"

import { useMemo } from "react"
import type { Transaction } from "@/types/transaction"
import { formatCurrency } from "@/lib/format-currency"
import { Card, CardContent } from "@/components/ui/card"

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
    })

    return Object.entries(groups).sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <div className="space-y-3 max-w-md">
          <p className="text-xl font-medium">아직 거래 내역이 없습니다</p>
          <p className="text-sm text-muted-foreground">
            채팅창에 &quot;담배 4800&quot;와 같이 입력하여 지출을 기록하거나, &quot;월급 2000000&quot;와 같이 입력하여
            수입을 기록해보세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groupedTransactions.map(([date, transactions]) => (
        <div key={date} className="space-y-3">
          <h3 className="sticky top-0 bg-background py-2 text-sm font-medium">{date}</h3>
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <Card
                key={index}
                className={`overflow-hidden transition-all hover:shadow-md ${
                  transaction.type === "expense"
                    ? "border-l-4 border-l-red-500 dark:border-l-red-400"
                    : "border-l-4 border-l-blue-500 dark:border-l-blue-400"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === "expense"
                          ? "text-red-500 dark:text-red-400"
                          : "text-blue-500 dark:text-blue-400"
                      }`}
                    >
                      {transaction.type === "expense" ? "-" : "+"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
