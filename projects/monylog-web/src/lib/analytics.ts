// Utility functions for analytics page: date range, previous period, tag aggregation
import type { Expenses } from "@/types/expenses";

export type Period = "week" | "month" | "quarter" | "year";

export interface DateRange {
  startDate?: string;
  endDate?: string;
  period?: Period;
}

export function getDateRange(period: Period) {
  const now = new Date();
  const start = new Date();
  switch (period) {
    case "week":
      start.setDate(now.getDate() - now.getDay());
      break;
    case "month":
      start.setDate(1);
      break;
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      break;
    case "year":
      start.setMonth(0, 1);
      break;
  }
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getPreviousDateRange(period: Period) {
  const { start, end } = getDateRange(period);
  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { start: prevStart, end: prevEnd };
}

export interface TagData {
  tag: string;
  expenseAmount: number;
  incomeAmount: number;
  netAmount: number;
  expenseCount: number;
  incomeCount: number;
  totalCount: number;
  expensePercentage: number;
  incomePercentage: number;
  trend: "up" | "down" | "same";
  trendPercentage: number;
}

export function aggregateTagData(
  expenses: Expenses[],
  selectedPeriod: Period,
  viewType: "expense" | "income" | "both"
): TagData[] {
  const { start, end } = getDateRange(selectedPeriod);
  const { start: prevStart, end: prevEnd } = getPreviousDateRange(selectedPeriod);
  const currentExpenses = expenses.filter((t) => {
    const date = new Date(t.dt);
    return date >= start && date <= end;
  });
  const previousExpenses = expenses.filter((t) => {
    const date = new Date(t.dt);
    return date >= prevStart && date <= prevEnd;
  });
  const tagMap = new Map<string, TagData>();
  const prevTagMap = new Map<string, { expense: number; income: number }>();
  previousExpenses.forEach((expense) => {
    (expense.tags.length ? expense.tags : [{ name: "기타" }]).forEach((tag) => {
      const tagName = tag.name;
      const current = prevTagMap.get(tagName) || { expense: 0, income: 0 };
      if (expense.type === "expense") {
        current.expense += expense.amount;
      } else {
        current.income += expense.amount;
      }
      prevTagMap.set(tagName, current);
    });
  });
  currentExpenses.forEach((expense) => {
    (expense.tags.length ? expense.tags : [{ name: "기타" }]).forEach((tag) => {
      const tagName = tag.name;
      const current = tagMap.get(tagName);
      if (current) {
        if (expense.type === "expense") {
          current.expenseAmount += expense.amount;
          current.expenseCount += 1;
        } else {
          current.incomeAmount += expense.amount;
          current.incomeCount += 1;
        }
        current.totalCount += 1;
        current.netAmount = current.incomeAmount - current.expenseAmount;
      } else {
        tagMap.set(tagName, {
          tag: tagName,
          expenseAmount: expense.type === "expense" ? expense.amount : 0,
          incomeAmount: expense.type === "income" ? expense.amount : 0,
          netAmount:
            expense.type === "income" ? expense.amount : -expense.amount,
          expenseCount: expense.type === "expense" ? 1 : 0,
          incomeCount: expense.type === "income" ? 1 : 0,
          totalCount: 1,
          expensePercentage: 0,
          incomePercentage: 0,
          trend: "same",
          trendPercentage: 0,
        });
      }
    });
  });
  const totalExpense = Array.from(tagMap.values()).reduce(
    (sum, tag) => sum + tag.expenseAmount,
    0,
  );
  const totalIncome = Array.from(tagMap.values()).reduce(
    (sum, tag) => sum + tag.incomeAmount,
    0,
  );
  const result: TagData[] = Array.from(tagMap.values()).map((tag) => {
    const expensePercentage =
      totalExpense > 0 ? (tag.expenseAmount / totalExpense) * 100 : 0;
    const incomePercentage =
      totalIncome > 0 ? (tag.incomeAmount / totalIncome) * 100 : 0;
    const prevData = prevTagMap.get(tag.tag) || { expense: 0, income: 0 };
    const prevNet = prevData.income - prevData.expense;
    let trend: "up" | "down" | "same" = "same";
    let trendPercentage = 0;
    if (prevNet !== 0) {
      const change = ((tag.netAmount - prevNet) / Math.abs(prevNet)) * 100;
      trendPercentage = Math.abs(change);
      if (change > 10) trend = "up";
      else if (change < -10) trend = "down";
      else trend = "same";
    } else if (tag.netAmount !== 0) {
      trend = tag.netAmount > 0 ? "up" : "down";
      trendPercentage = 100;
    }
    return {
      ...tag,
      expensePercentage,
      incomePercentage,
      trend,
      trendPercentage,
    };
  });
  return result.sort((a, b) => {
    if (viewType === "expense") return b.expenseAmount - a.expenseAmount;
    if (viewType === "income") return b.incomeAmount - a.incomeAmount;
    return Math.abs(b.netAmount) - Math.abs(a.netAmount);
  });
}

/**
 * API 쿼리용: startDate, endDate 모두 포함하는 yyyy-mm-dd 문자열 반환
 */
export function getInclusiveDateRange(period: Period): { startDate: string; endDate: string } {
  const now = new Date();
  let startDate: string, endDate: string;
  switch (period) {
    case "month": {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = firstDay.toISOString().slice(0, 10);
      endDate = lastDay.toISOString().slice(0, 10);
      break;
    }
    case "week": {
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
      const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
      startDate = monday.toISOString().slice(0, 10);
      endDate = sunday.toISOString().slice(0, 10);
      break;
    }
    case "quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      const firstDay = new Date(now.getFullYear(), quarter * 3, 1);
      const lastDay = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      startDate = firstDay.toISOString().slice(0, 10);
      endDate = lastDay.toISOString().slice(0, 10);
      break;
    }
    case "year": {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      const lastDay = new Date(now.getFullYear(), 11, 31);
      startDate = firstDay.toISOString().slice(0, 10);
      endDate = lastDay.toISOString().slice(0, 10);
      break;
    }
    default:
      throw new Error("Invalid period");
  }
  return { startDate, endDate };
}
