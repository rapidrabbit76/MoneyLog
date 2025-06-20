import { create } from 'zustand';
import { Expenses } from '@/types/expenses';
import { getExpenses } from '@/lib/api/expenses';

// zustand store: 지출(Expenses) 등 도메인 상태만 관리합니다.
// selector 패턴으로 필요한 상태만 구독하세요.
// UI/임시 상태는 context 또는 로컬 state로 관리하세요.

interface ExpensesState {
  expenses: Expenses[];
  isLoading: boolean;
  setExpenses: (expenses: Expenses[]) => void;
  addExpense: (expense: Expenses) => void;
  deleteExpense: (id: number) => void;
  fetchExpenses: () => Promise<void>;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  isLoading: false,
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  deleteExpense: (id) => set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) })),
  fetchExpenses: async () => {
    set({ isLoading: true });
    try {
      const expenses = await getExpenses({ page: 1, size: 500 });
      set({ expenses });
    } catch (error) {
      // 에러 핸들링 필요시 추가
    } finally {
      set({ isLoading: false });
    }
  },
}));
