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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { da, ko } from "date-fns/locale";
import { format, format as formatDate, set } from "date-fns";
import { useEffect, useState } from "react";
import { PeriodOrCustom } from "@/components/insights/PeriodSelector";
import { CustomCalendar } from "@/components/ui/custom-calendar";
const periodLabels = {
  week: "이번 주",
  month: "이번 달",
  quarter: "이번 분기",
  year: "올해",
};

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOrCustom>("month");
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
  // 사용자 기간 지정용 상태
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [calendarOpen, setCalendarOpen] = useState(false);

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
    // custom일 때만 dateRange 사용, 아니면 기존 기간 사용
    let startDate: string, endDate: string;
    if (selectedPeriod === "custom" && dateRange.from && dateRange.to) {
      startDate = dateRange.from;
      endDate = dateRange.to;
    } else {
      const range = getInclusiveDateRange(selectedPeriod === "custom" ? "month" : selectedPeriod);
      startDate = format(new Date(range.startDate), "yyyy-MM-dd");
      endDate = format(new Date(range.endDate), "yyyy-MM-dd");
    }
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
  }, [selectedPeriod, tags, dateRange]);

  useEffect(() => {
    let startDate: string, endDate: string;
    if (selectedPeriod === "custom" && dateRange.from && dateRange.to) {
      startDate = dateRange.from;
      endDate = dateRange.to;
    } else {
      const range = getInclusiveDateRange(selectedPeriod === "custom" ? "month" : selectedPeriod);
      startDate = format(new Date(range.startDate), "yyyy-MM-dd");
      endDate = format(new Date(range.endDate), "yyyy-MM-dd");
    }
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
  }, [selectedPeriod, dateRange]);

  // 사용자 기간 지정용 날짜 표시
  const rangeLabel = dateRange.from && dateRange.to
    ? `${dateRange.from} ~ ${dateRange.to}`
    : "시작일 ~ 종료일";

  // 캘린더에서 날짜 선택 시 endDate까지 선택되면 바로 상태 반영 및 팝오버 닫기
  const handleCalendarSelect = (range?: { from?: string; to?: string }) => {
    setDateRange(range ?? {});
    if (range?.from && range?.to) {
      setCalendarOpen(false);
    }
  };

  // 캘린더 Clear/Confirm 핸들러
  const handleClear = () => {
    setDateRange({});
    setCalendarOpen(false);
  };
  const handleConfirm = () => {
    setCalendarOpen(false);
  };

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
          {selectedPeriod === "custom" && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[220px] justify-start text-left font-normal ${!dateRange.from ? "text-muted-foreground" : ""}`}
                  onClick={() => setCalendarOpen(true)}
                  aria-label="기간 선택 열기"
                >
                  {rangeLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <div className="flex flex-col items-center">
                  <CustomCalendar
                    value={{
                      from: dateRange.from ? new Date(dateRange.from) : undefined,
                      to: dateRange.to ? new Date(dateRange.to) : undefined,
                    }}
                    onChange={handleCalendarSelect}
                  />
                  <div className="flex gap-2 justify-end w-full px-4 pb-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={handleClear}>Clear</Button>
                    <Button variant="default" size="sm" onClick={handleConfirm} disabled={!dateRange.from || !dateRange.to}>Confirm</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
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
            periodLabel={selectedPeriod === "custom" ? rangeLabel : periodLabels[selectedPeriod]}
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
        periodLabel={selectedPeriod === "custom" ? rangeLabel : periodLabels[selectedPeriod]}
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}
