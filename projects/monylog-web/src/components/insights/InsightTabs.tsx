import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calculator, BarChart3, PieChart } from "lucide-react";
import { TagData } from "@/lib/analytics";
import { TagAnalysisCard } from "./TagAnalysisCard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SummaryResponseData } from "@/lib/api/insights";

interface InsightTabsTabsProps {
  viewType: "expense" | "income" | "both";
  setViewType: (v: "expense" | "income" | "both") => void;
  tagData: SummaryResponseData[];
  periodLabel: string;
  selectedPeriod: string;
}

export function InsightTabs({ viewType, setViewType, tagData, periodLabel, selectedPeriod }: InsightTabsTabsProps) {
  return (
    <Tabs value={viewType} onValueChange={(value) => setViewType(value as any)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="both" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" /> 전체 분석
        </TabsTrigger>
        <TabsTrigger value="expense" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> 지출 분석
        </TabsTrigger>
        <TabsTrigger value="income" className="flex items-center gap-2">
          <PieChart className="h-4 w-4" /> 수입 분석
        </TabsTrigger>
      </TabsList>
      <TabsContent value="both" className="space-y-4">
        <TagAnalysisCard tagData={tagData} periodLabel={periodLabel} selectedPeriod={selectedPeriod} type="both" />
      </TabsContent>
      <TabsContent value="expense" className="space-y-4">
        <TagAnalysisCard tagData={tagData} periodLabel={periodLabel} selectedPeriod={selectedPeriod} type="expense" />
      </TabsContent>
      <TabsContent value="income" className="space-y-4">
        <TagAnalysisCard tagData={tagData} periodLabel={periodLabel} selectedPeriod={selectedPeriod} type="income" />
      </TabsContent>
    </Tabs>
  );
}
