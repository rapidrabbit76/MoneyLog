"use client";

import { cn } from "@/lib/utils";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Expenses } from "@/types/expenses";
import { formatCurrency } from "@/lib/format-currency";

interface CalendarViewProps {
  expenses: Expenses[];
}

export function CalendarView({ expenses }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 이전 달로 이동
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // 다음 달로 이동
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // 현재 달의 첫 날과 마지막 날
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // 달력에 표시할 날짜 배열 생성
  const calendarDays = useMemo(() => {
    const days = [];

    // 이전 달의 날짜들 (첫 주 채우기)
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0: 일요일, 1: 월요일, ...
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth, -i);
      days.push({
        date,
        isCurrentMonth: false,
      });
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        date,
        isCurrentMonth: true,
      });
    }

    // 다음 달의 날짜들 (마지막 주 채우기)
    const lastDayOfWeek = lastDayOfMonth.getDay(); // 0: 일요일, 6: 토요일
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth, firstDayOfMonth, lastDayOfMonth]);

  // 날짜별 거래 내역 그룹화
  const expensesByDate = useMemo(() => {
    const grouped: Record<string, Expenses[]> = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.dt);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(expense);
    });

    return grouped;
  }, [expenses]);

  // 날짜별 총액 계산
  const getDailyTotals = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const dayExpenses = expensesByDate[dateKey] || [];

    const expense = dayExpenses
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const income = dayExpenses
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    return { expense, income };
  };

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {currentYear}년 {monthNames[currentMonth]}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            className="rounded-full h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
            className="rounded-full"
          >
            오늘
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="rounded-full h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {/* 요일 헤더 */}
        {dayNames.map((day, index) => (
          <div
            key={index}
            className={cn(
              "text-center font-medium py-2",
              index === 0 ? "text-red-500 dark:text-red-400" : "",
              index === 6 ? "text-blue-500 dark:text-blue-400" : "",
            )}
          >
            {day}
          </div>
        ))}

        {/* 달력 날짜 */}
        {calendarDays.map((day, index) => {
          const { expense, income } = getDailyTotals(day.date);
          const hasExpenses = expense > 0 || income > 0;
          const isToday =
            day.date.getDate() === new Date().getDate() &&
            day.date.getMonth() === new Date().getMonth() &&
            day.date.getFullYear() === new Date().getFullYear();

          return (
            <Card
              key={index}
              className={cn(
                "min-h-[100px] transition-all hover:shadow-md",
                !day.isCurrentMonth ? "opacity-40" : "",
                isToday ? "border-primary ring-1 ring-primary" : "",
                hasExpenses ? "hover:border-primary" : "",
              )}
            >
              <CardContent className="p-3">
                <div
                  className={cn(
                    "text-right text-sm font-medium",
                    day.date.getDay() === 0
                      ? "text-red-500 dark:text-red-400"
                      : "",
                    day.date.getDay() === 6
                      ? "text-blue-500 dark:text-blue-400"
                      : "",
                  )}
                >
                  {day.date.getDate()}
                </div>

                {hasExpenses && (
                  <div className="mt-2 space-y-1 text-xs">
                    {expense > 0 && (
                      <div className="text-red-500 dark:text-red-400">
                        -{formatCurrency(expense)}
                      </div>
                    )}
                    {income > 0 && (
                      <div className="text-blue-500 dark:text-blue-400">
                        +{formatCurrency(income)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
