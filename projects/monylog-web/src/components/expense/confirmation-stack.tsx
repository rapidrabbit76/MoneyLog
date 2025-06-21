"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Edit, ArrowLeft, ArrowRight } from "lucide-react";
import type { ParsedExpense } from "@/lib/expense-message";
import { useTagStore } from "@/store/tag-store";
import { MultiSelectChips } from "@/components/ui/multi-select-chips";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ExpensesConfirmationStackProps {
  tags: string[];
  expenses: {
    title: string;
    tags: string[];
    amount: number;
    dt: string;
    type: "expense" | "income";
  }[];
  onConfirm: (expenses: ParsedExpense[]) => void;
  onCancel: () => void;
}

export function ExpensesConfirmationStack({
  tags,
  expenses,
  onConfirm,
  onCancel,
}: ExpensesConfirmationStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmedExpenses, setConfirmedExpenses] = useState<ParsedExpense[]>(
    [],
  );
  const [editingExpenses, setEditingExpenses] = useState<
    {
      title: string;
      tags: string[];
      amount: number;
      dt: string;
      type: "expense" | "income";
    }[]
  >(expenses);
  const [isEditing, setIsEditing] = useState(false);

  const currentExpenses = editingExpenses[currentIndex];
  const totalExpenses = editingExpenses.length;
  const progress = ((currentIndex + 1) / totalExpenses) * 100;

  const handleConfirmCurrent = () => {
    const confirmed = [...confirmedExpenses, currentExpenses];
    setConfirmedExpenses(confirmed);

    if (currentIndex < editingExpenses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsEditing(false);
    } else {
      // 모든 거래 확인 완료
      onConfirm(confirmed);
    }
  };

  const handleSkipCurrent = () => {
    // 현재 거래를 제외하고 다음으로
    const updatedExpenses = editingExpenses.filter(
      (_, index) => index !== currentIndex,
    );
    setEditingExpenses(updatedExpenses);

    if (updatedExpenses.length === 0) {
      // 모든 거래가 제거됨
      onConfirm(confirmedExpenses);
    } else if (currentIndex >= updatedExpenses.length) {
      // 마지막 거래를 제거한 경우
      setCurrentIndex(updatedExpenses.length - 1);
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // 원래 값으로 복원
    const originalExpense = expenses.find(
      (t) => t.title === currentExpenses.title,
    );
    if (originalExpense) {
      const updatedExpenses = [...editingExpenses];
      updatedExpenses[currentIndex] = originalExpense;
      setEditingExpenses(updatedExpenses);
    }
    setIsEditing(false);
  };

  const handleExpenseChange = (field: keyof ParsedExpense, value: any) => {
    const updatedExpense = [...editingExpenses];
    updatedExpense[currentIndex] = {
      ...updatedExpense[currentIndex],
      [field]: value,
    };
    setEditingExpenses(updatedExpense);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsEditing(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < editingExpenses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsEditing(false);
    }
  };

  if (editingExpenses.length === 0) {
    return null;
  }

  // 팝업(모달) 구조: 오버레이 + 중앙 카드
  return (
    <>
      {/* 어두운 오버레이 */}
      <div className="fixed inset-0 bg-black/90 z-40" />
      {/* 중앙 카드 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="w-full max-w-lg">
          {/* 진행 상황 표시 */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>거래 확인 진행상황</span>
              <span>
                {currentIndex + 1} / {totalExpenses}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {/* 카드 */}
          <Card
            // 팝업 카드: 완전 불투명, 그림자, z-50
            className="bg-background border-primary shadow-2xl z-50"
            style={{
              opacity: 1,
              position: 'relative',
            }}
          >
            {/* 기존 카드 내용 렌더링 */}
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                거래 내역 확인
                {!isEditing && (
                  <Button variant="ghost" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                      id="title"
                      value={currentExpenses.title}
                      onChange={(e) => handleExpenseChange("title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">금액</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={currentExpenses.amount}
                      onChange={(e) =>
                        handleExpenseChange(
                          "amount",
                          Number.parseFloat(e.target.value),
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <Label htmlFor="type">유형</Label>
                    <div className="flex items-center gap-2">
                      <Badge
                        role="button"
                        tabIndex={0}
                        aria-label={`유형: ${currentExpenses.type === "expense" ? "지출" : "수입"} (클릭 시 변경)`}
                        className={`cursor-pointer select-none px-3 py-0 text-base ${currentExpenses.type === "expense" ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}
                        onClick={() => handleExpenseChange("type", currentExpenses.type === "expense" ? "income" : "expense")}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleExpenseChange("type", currentExpenses.type === "expense" ? "income" : "expense");
                          }
                        }}
                      >
                        {currentExpenses.type === "expense" ? "지출" : "수입"}
                      </Badge>
                    </div>
                  </div>

                  {/* 태그 선택 부분 교체 */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">태그</Label>
                    <MultiSelectChips
                      options={tags.map((t) => ({ id: t, name: t }))}
                      selected={currentExpenses.tags.map((t) => ({ id: t, name: t }))}
                      onChange={(selected) =>
                        handleExpenseChange(
                          "tags",
                          selected.map((t) => t.name),
                        )
                      }
                      placeholder="태그 선택"
                    />
                  </div>

                  {/* 날짜/시간 수정 UI - Popover 형태 */}
                  <div className="space-y-2">
                    <Label htmlFor="dt">날짜/시간</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {currentExpenses.dt
                            ? `${new Date(currentExpenses.dt).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })} ${new Date(currentExpenses.dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                            : "날짜/시간 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="min-w-[320px] max-w-[360px] p-0 z-50" align="center" sideOffset={8} style={{ boxShadow: "0 8px 32px 0 rgba(0,0,0,0.25)" }}>
                        <div className="flex flex-col gap-2 p-4">
                          <Calendar
                            mode="single"
                            selected={currentExpenses.dt ? new Date(currentExpenses.dt) : undefined}
                            onSelect={(date: Date | undefined) => {
                              if (!date) return;
                              const prev = currentExpenses.dt ? new Date(currentExpenses.dt) : new Date();
                              date.setHours(prev.getHours());
                              date.setMinutes(prev.getMinutes());
                              handleExpenseChange("dt", date.toISOString());
                            }}
                            className="rounded-md border bg-background shadow-md"
                          />
                          <div className="w-32 flex flex-col gap-1">
                            <Label htmlFor="dt-time" className="text-xs">시간</Label>
                            <Input
                              id="dt-time"
                              type="time"
                              value={currentExpenses.dt ? new Date(currentExpenses.dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : ""}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":");
                                const date = currentExpenses.dt ? new Date(currentExpenses.dt) : new Date();
                                date.setHours(Number(hours));
                                date.setMinutes(Number(minutes));
                                handleExpenseChange("dt", date.toISOString());
                              }}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveEdit} className="flex-1">
                      <Check className="h-4 w-4 mr-2" />
                      저장
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      취소
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        제목:
                      </span>
                      <span className="font-medium">
                        {currentExpenses.title}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        금액:
                      </span>
                      <span
                        className={`font-bold text-lg ${currentExpenses.type === "expense"
                          ? "text-red-500 dark:text-red-400"
                          : "text-blue-500 dark:text-blue-400"
                          }`}
                      >
                        {currentExpenses.type === "expense" ? "-" : "+"}
                        {new Intl.NumberFormat("ko-KR", {
                          style: "currency",
                          currency: "KRW",
                          maximumFractionDigits: 0,
                        }).format(currentExpenses.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        유형:
                      </span>
                      <Badge
                        role="button"
                        tabIndex={0}
                        aria-label={`유형: ${currentExpenses.type === "expense" ? "지출" : "수입"} (클릭 시 변경)`}
                        className={`cursor-pointer select-none px-3 py-0 text-base ${currentExpenses.type === "expense" ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}
                        onClick={() => handleExpenseChange("type", currentExpenses.type === "expense" ? "income" : "expense")}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleExpenseChange("type", currentExpenses.type === "expense" ? "income" : "expense");
                          }
                        }}
                      >
                        {currentExpenses.type === "expense" ? "지출" : "수입"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        태그:
                      </span>
                      <Badge variant="outline">{currentExpenses.tags.join(", ")}</Badge>
                    </div>
                  </div>

                  {/* 네비게이션 버튼 */}
                  {totalExpenses > 1 && (
                    <div className="flex justify-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={currentIndex === editingExpenses.length - 1}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* 확인/건너뛰기 버튼 */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleConfirmCurrent}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      확인
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSkipCurrent}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      건너뛰기
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          {/* 전체 취소 버튼 */}
          <div className="flex justify-center pt-4">
            <Button variant="ghost" onClick={onCancel}>
              전체 취소
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
