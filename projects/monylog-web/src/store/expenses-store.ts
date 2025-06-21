import { create } from "zustand";
import { Expenses } from "@/types/expenses";
import { getExpenses, deleteExpense as apiDeleteExpense } from "@/lib/api/expenses";
import { toast } from "@/hooks/use-toast";

// zustand store: 지출(Expenses) 등 도메인 상태만 관리합니다.
// selector 패턴으로 필요한 상태만 구독하세요.
// UI/임시 상태는 context 또는 로컬 state로 관리하세요.

interface ExpensesState {
  expenses: Expenses[];
  isLoading: boolean;
  setExpenses: (expenses: Expenses[]) => void;
  addExpense: (expense: Expenses) => void;
  deleteExpense: (id: number) => void;
  deleteExpenseAsync: (id: number) => Promise<void>;
  fetchExpenses: () => Promise<void>;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  isLoading: false,
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) =>
    set((state) => ({ expenses: [expense, ...state.expenses] })),
  deleteExpense: (id) =>
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),
  deleteExpenseAsync: async (id) => {
    await apiDeleteExpense(id);
    get().deleteExpense(id);
  },
  fetchExpenses: async () => {
    set({ isLoading: true });
    try {
      const expenses = await getExpenses({ page: 1, size: 500 });
      set({ expenses });
    } catch (error) {
      toast({
        title: "지출 목록 불러오기 실패",
        description:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
