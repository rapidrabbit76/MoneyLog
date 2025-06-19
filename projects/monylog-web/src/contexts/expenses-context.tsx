"use client"

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { Expenses } from "@/types/expenses"
import { getExpenses, } from "@/lib/api/expenses"

interface ExpensesState {
  expenses: Expenses[]
  isLoading: boolean
}

type ExpensesAction =
  | { type: "SET_EXPENSES"; payload: Expenses[] }
  | { type: "ADD_EXPENSE"; payload: Expenses }
  | { type: "UPDATE_EXPENSE"; payload: { id: string; expense: Partial<Expenses> } }
  | { type: "DELETE_EXPENSE"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "REFRESH_EXPENSES" }

interface ExpensesContextType extends ExpensesState {
  addExpense: (Expense: Expenses) => void
  // updateExpense: (id: number, expense: Partial<Expenses>) => void
  deleteExpense: (id: number) => void
  setExpenses: (Expenses: Expenses[]) => void
  refreshExpenses?: () => void
}

export const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined)

function ExpensesReducer(state: ExpensesState, action: ExpensesAction): ExpensesState {
  switch (action.type) {
    case "SET_EXPENSES":
      return {
        ...state,
        expenses: action.payload
      }
    case "ADD_EXPENSE":
      const newExpenses = [action.payload, ...state.expenses]
      return {
        ...state,
        expenses: newExpenses
      }
    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload
      }
    case "REFRESH_EXPENSES":
      return {
        ...state,
        isLoading: true
      }
    default:
      return state
  }
}

const STORAGE_KEY = "expenses"

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ExpensesReducer, {
    expenses: [],
    isLoading: true
  })

  // Load expenses from localStorage on mount
  useEffect(() => {
    try {
      getExpenses({ page: 1, size: 500 }).then((expenses) => {
        dispatch({ type: "SET_EXPENSES", payload: expenses })
      }
      ).catch((error) => {
        console.error("Failed to load expenses:", error)
        dispatch({ type: "SET_LOADING", payload: false })
      })
    } catch (error) {
      console.error("Failed to load expenses from localStorage:", error)
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const addExpense = (expense: Expenses) => {
    dispatch({ type: "ADD_EXPENSE", payload: expense })
  }

  // const updateExpense = (id: number, expense: Partial<Expenses>) => {
  //   dispatch({ type: "UPDATE_EXPENSE", payload: { id, expense } })
  // }

  const deleteExpense = (id: number) => {
    dispatch({ type: "DELETE_EXPENSE", payload: id })
  }

  const setExpenses = (expenses: Expenses[]) => {
    dispatch({ type: "SET_EXPENSES", payload: expenses })
  }

  const refreshExpenses = () => {
    dispatch({ type: "REFRESH_EXPENSES" })
    try {
      getExpenses({ page: 1, size: 500 }).then((expenses) => {
        dispatch({ type: "SET_EXPENSES", payload: expenses })
        return expenses
      }).catch((error) => {
      }).finally(() => {
        dispatch({ type: "SET_LOADING", payload: false })
      })
    } catch (error) {
      console.error("Failed to refresh transactions:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const contextValue: ExpensesContextType = {
    ...state,
    addExpense,
    deleteExpense,
    setExpenses,
    refreshExpenses
  }

  return (
    <ExpensesContext.Provider value={contextValue}>
      {children}
    </ExpensesContext.Provider>
  )
}

export function useExpenses() {
  const context = useContext(ExpensesContext)
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpensesProvider")
  }
  return context
}
