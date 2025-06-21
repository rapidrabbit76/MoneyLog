"use client";

import { useState } from "react";
import { useExpenses } from "@/hooks/use-expenses";
import { useTagStore } from "@/store/tag-store";
import { PeriodSelector } from "@/components/analytics/PeriodSelector";
import { SummaryCards } from "@/components/analytics/SummaryCards";
import { AnalysisTabs } from "@/components/analytics/AnalysisTabs";
import { aggregateTagData, Period } from "@/lib/analytics";

export default function AnalyticsPage() {
  const { expenses } = useExpenses();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");
  const [viewType, setViewType] = useState<"expense" | "income" | "both">("both");
  const tags = useTagStore((state) => state.tags);

  const periodLabels = {
    week: "이번 주",
    month: "이번 달",
    quarter: "이번 분기",
    year: "올해",
  };

  const tagData = aggregateTagData(expenses, selectedPeriod, viewType);
  const totals = tagData.reduce(
    (acc, tag) => ({
      expense: acc.expense + tag.expenseAmount,
      income: acc.income + tag.incomeAmount,
      net: acc.net + tag.netAmount,
      expenseCount: acc.expenseCount + tag.expenseCount,
      incomeCount: acc.incomeCount + tag.incomeCount,
    }),
    { expense: 0, income: 0, net: 0, expenseCount: 0, incomeCount: 0 },
  );

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">분석</h1>
          <p className="text-muted-foreground">태그별 수입과 지출을 분석해보세요</p>
        </div>
        <div className="flex items-center gap-4">
          <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
        </div>
      </div>
      {/* 요약 카드들 */}
      <SummaryCards
        expense={totals.expense}
        income={totals.income}
        net={totals.net}
        expenseCount={totals.expenseCount}
        incomeCount={totals.incomeCount}
        periodLabel={periodLabels[selectedPeriod]}
      />
      {/* 분석 탭 */}
      <AnalysisTabs
        viewType={viewType}
        setViewType={setViewType}
        tagData={tagData}
        periodLabel={periodLabels[selectedPeriod]}
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}
