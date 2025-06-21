import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";

interface SummaryCardsProps {
  expense: number;
  income: number;
  net: number;
  expenseCount: number;
  incomeCount: number;
  periodLabel: string;
}

function getNetAmountColor(amount: number) {
  if (amount > 0) return "text-blue-500 dark:text-blue-400";
  if (amount < 0) return "text-red-500 dark:text-red-400";
  return "text-muted-foreground";
}

function getNetAmountIcon(amount: number) {
  if (amount > 0) return <ArrowUpCircle className="h-4 w-4 text-blue-500" />;
  if (amount < 0) return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export function SummaryCards({ expense, income, net, expenseCount, incomeCount, periodLabel }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 지출</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500 dark:text-red-400">
            {formatCurrency(expense)}
          </div>
          <p className="text-xs text-muted-foreground">{expenseCount}건의 거래</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 수입</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
            {formatCurrency(income)}
          </div>
          <p className="text-xs text-muted-foreground">{incomeCount}건의 거래</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">순 수지</CardTitle>
          {getNetAmountIcon(net)}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getNetAmountColor(net)}`}>{formatCurrency(net)}</div>
          <p className="text-xs text-muted-foreground">
            {periodLabel} {net >= 0 ? "흑자" : "적자"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
