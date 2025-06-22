import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Period } from "@/lib/analytics";

export type PeriodOrCustom = Period | "custom";

interface PeriodSelectorProps {
  value: PeriodOrCustom;
  onChange: (value: PeriodOrCustom) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="week">이번 주</SelectItem>
        <SelectItem value="month">이번 달</SelectItem>
        <SelectItem value="quarter">이번 분기</SelectItem>
        <SelectItem value="year">올해</SelectItem>
        <SelectItem value="custom">사용자 기간 지정</SelectItem>
      </SelectContent>
    </Select>
  );
}
