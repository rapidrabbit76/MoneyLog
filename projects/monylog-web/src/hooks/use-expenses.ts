import { useExpensesStore } from "@/store/expenses-store";

export function useExpenses() {
  const expenses = useExpensesStore((state) => state.expenses);
  const isLoading = useExpensesStore((state) => state.isLoading);
  const setExpenses = useExpensesStore((state) => state.setExpenses);
  const addExpense = useExpensesStore((state) => state.addExpense);
  const deleteExpense = useExpensesStore((state) => state.deleteExpense);
  const fetchExpenses = useExpensesStore((state) => state.fetchExpenses);

  return {
    expenses,
    isLoading,
    setExpenses,
    addExpense,
    deleteExpense,
    fetchExpenses,
  };
}
