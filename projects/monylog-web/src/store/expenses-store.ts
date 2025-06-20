import { create } from 'zustand';
import { Expenses } from '@/types/expenses';
import { getExpenses } from '@/lib/api/expenses';

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
