"use client";

import { useMemo } from "react";
import type { Expenses } from "@/types/expenses";
import { formatCurrency } from "@/lib/format-currency";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExpenseListProps {
  expenses: Expenses[];
}

export function ExpenseViewList({ expenses }: ExpenseListProps) {
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expenses[]> = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.dt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(expense);
    });

    return Object.entries(groups).sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <div className="space-y-3 max-w-md">
          <p className="text-xl font-medium">아직 거래 내역이 없습니다</p>
          <p className="text-sm text-muted-foreground">
            {/* TODO: 담배 관련 내용 제거해야 할듯 */}
            채팅창에 &quot;담배 4800&quot;와 같이 입력하여 지출을 기록하거나,
            &quot;월급 2000000&quot;와 같이 입력하여 수입을 기록해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedExpenses.map(([date, expenses]) => (
        <div key={date} className="space-y-3">
          <h3 className="sticky top-0 bg-background py-2 text-sm font-medium">
            {date}
          </h3>
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <Card
                key={index}
                className={`overflow-hidden transition-all hover:shadow-md ${expense.type === "expense"
                  ? "border-l-4 border-l-red-500 dark:border-l-red-400"
                  : "border-l-4 border-l-blue-500 dark:border-l-blue-400"
                  }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{expense.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(expense.dt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {expense.tags.length === 0 ? (
                          <span>태그 없음</span>
                        ) : (
                          expense.tags.map((tag) => (
                            <Badge key={tag.id} className="mr-1 mt-1">
                              {tag.name}
                            </Badge>
                          ))
                        )}
                      </p>
                    </div>
                    <p
                      className={`text-lg font-bold ${expense.type === "expense"
                        ? "text-red-500 dark:text-red-400"
                        : "text-blue-500 dark:text-blue-400"
                        }`}
                    >
                      {expense.type === "expense" ? "-" : "+"}
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
