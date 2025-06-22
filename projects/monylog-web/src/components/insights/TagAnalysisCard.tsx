import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { TagData } from "@/lib/analytics";
import { SummaryResponseData } from "@/lib/api/insights";


export interface TagAnalysisCardData extends SummaryResponseData {
  name: string; // 태그 이름 추가
}

interface TagAnalysisCardProps {
  tagData: TagAnalysisCardData[];
  periodLabel: string;
  selectedPeriod: string;
  type: "both" | "expense" | "income";
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
function getTrendIcon(trend: "up" | "down" | "same") {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
}
function getTrendColor(trend: "up" | "down" | "same") {
  switch (trend) {
    case "up":
      return "text-green-500";
    case "down":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

export function TagAnalysisCard({ tagData, periodLabel, selectedPeriod, type }: TagAnalysisCardProps) {
  let filtered = tagData;
  if (type === "expense") filtered = tagData.filter((data) => data.count.expense > 0);
  if (type === "income") filtered = tagData.filter((data) => data.count.income > 0);
  if (type === "both") filtered = tagData;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === "both" && <>태그별 종합 분석</>}
          {type === "expense" && <>지출 분석</>}
          {type === "income" && <>수입 분석</>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {periodLabel} {type === "expense" ? "지출" : type === "income" ? "수입" : "거래"} 내역이 없습니다
            </p>
          </div>
        ) : (
          <div className={type === "both" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
            {filtered.map((data) => (
              <Card key={data.name} className={type === "both" ? "hover:shadow-md transition-shadow" : undefined}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-medium">{data.name}</Badge>
                      {/* <div className="flex items-center gap-1">
                        {getTrendIcon(data.trend)}
                        {data.trend !== "same" && (
                          <span className={`text-sm font-medium ${getTrendColor(data.trend)}`}>{data.trendPercentage.toFixed(0)}%</span>
                        )}
                      </div> */}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">순 수지</span>
                      <div className="flex items-center gap-2">
                        {getNetAmountIcon(Number(data.amount.total))}
                        <span className={`font-bold ${getNetAmountColor(Number(data.amount.total))}`}>{formatCurrency(Number(data.amount.total))}</span>
                      </div>
                    </div>
                    {data.count.expense > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">지출</span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-red-500 dark:text-red-400">{formatCurrency(Number(data.amount.expense))}</div>
                          <div className="text-xs text-muted-foreground">{data.count.expense}건</div>
                        </div>
                      </div>
                    )}
                    {data.count.income > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">수입</span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-500 dark:text-blue-400">{formatCurrency(Number(data.amount.income))}</div>
                          <div className="text-xs text-muted-foreground">{data.count.income}건</div>
                        </div>
                      </div>
                    )}
                    {/* {type !== "both" && (
                      <Progress value={type === "expense" ? data.expensePercentage : data.incomePercentage} className="h-2" />
                    )} */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
