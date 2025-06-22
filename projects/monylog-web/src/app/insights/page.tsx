"use client";

import { InsightTabs } from "@/components/insights/InsightTabs";
import { PeriodSelector } from "@/components/insights/PeriodSelector";
import { SummaryCards } from "@/components/insights/SummaryCards";
import { TagAnalysisCardData } from "@/components/insights/TagAnalysisCard";
import { useExpenses } from "@/hooks/use-expenses";
import { getInclusiveDateRange, Period, DateRange } from "@/lib/analytics";
import { getSummaryInsights, SummaryResponseData } from "@/lib/api/insights";
import { ExpenseTag } from "@/lib/api/tags";
import { useTagStore } from "@/store/tag-store";
import { Button } from "@/components/ui/button";
import { da, ko } from "date-fns/locale";
import { format, format as formatDate, set } from "date-fns";
import { useEffect, useState } from "react";
const periodLabels = {
  week: "이번 주",
  month: "이번 달",
  quarter: "이번 분기",
  year: "올해",
};

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: formatDate(new Date(), "yyyy-MM-dd", { locale: ko }),
    endDate: formatDate(new Date(), "yyyy-MM-dd", { locale: ko }),
  });
  const [viewType, setViewType] = useState<"expense" | "income" | "both">("both");
  const [summary, setSummary] = useState<SummaryResponseData>({
    amount: { expense: 0, income: 0, total: 0 },
    count: { expense: 0, income: 0, total: 0 },
    timeseries: [],
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  });
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<ExpenseTag[]>([]);
  const [tagData, setTagData] = useState<TagAnalysisCardData[]>([]);


  useEffect(() => {
    let { startDate, endDate } = getInclusiveDateRange(selectedPeriod);
    setDateRange({ startDate, endDate });
  }, [selectedPeriod]);

  useEffect(() => {
    const storedTags = useTagStore.getState().tags;
    if (storedTags.length > 0) {
      setTags(storedTags);
      return;
    }
    useTagStore.getState().fetchTags().then((fetchedTags) => {
      setTags(fetchedTags);
    });
  }, []);

  useEffect(() => {
    const { startDate, endDate } = dateRange;
    Promise.all(
      tags.map((tag) => getSummaryInsights({ startDate, endDate, tag: tag.name }))
    ).then((responses) => {
      const tagData: TagAnalysisCardData[] = responses.map((data, index) => ({
        name: tags[index].name,
        ...(data ?? {
          amount: { expense: 0, income: 0, total: 0 },
          count: { expense: 0, income: 0, total: 0 },
          timeseries: [],
        }),
      }));
      setTagData(tagData);
    });
  }, [dateRange, tags]);

  useEffect(() => {
    const { startDate, endDate } = dateRange;
    async function fetchSummary() {
      setError(null);
      try {
        const res = await getSummaryInsights({ startDate, endDate });
        setSummary(res ?? {
          amount: { expense: 0, income: 0, total: 0 },
          count: { expense: 0, income: 0, total: 0 },
          timeseries: [],
          startDate: undefined,
          endDate: undefined,
        });
      } catch (e: any) {
        setError(e.message || "요약 정보 불러오기 실패");
      }
    }
    fetchSummary();
  }, [dateRange]);

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
      <div className="relative">
        {summary && (
          <SummaryCards
            expense={Number(summary.amount.expense)}
            income={Number(summary.amount.income)}
            net={Number(summary.amount.total)}
            expenseCount={summary.count.expense}
            incomeCount={summary.count.income}
            periodLabel={periodLabels[selectedPeriod]}
          />
        )}
        {error && (
          <div className="text-red-500 mt-2">{error}</div>
        )}
      </div>
      <InsightTabs
        viewType={viewType}
        setViewType={setViewType}
        tagData={tagData}
        periodLabel={periodLabels[selectedPeriod]}
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}
