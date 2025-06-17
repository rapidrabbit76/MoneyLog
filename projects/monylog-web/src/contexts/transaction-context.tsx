"use client"

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { Transaction } from "@/types/transaction"

interface ExpenseState {
  transactions: Transaction[]
  isLoading: boolean
}

type TransactionAction =
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: { id: string; transaction: Partial<Transaction> } }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }

interface TransactionContextType extends ExpenseState {
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  setTransactions: (transactions: Transaction[]) => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

function transactionReducer(state: ExpenseState, action: TransactionAction): ExpenseState {
  switch (action.type) {
    case "SET_TRANSACTIONS":
      return {
        ...state,
        transactions: action.payload
      }
    case "ADD_TRANSACTION":
      const newTransactions = [action.payload, ...state.transactions]
      return {
        ...state,
        transactions: newTransactions
      }
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id
            ? { ...transaction, ...action.payload.transaction }
            : transaction
        )
      }
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload)
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload
      }
    default:
      return state
  }
}

const STORAGE_KEY = "transactions"

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(transactionReducer, {
    transactions: [],
    isLoading: true
  })

  // Load transactions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const transactions = JSON.parse(stored) as Transaction[]
        dispatch({ type: "SET_TRANSACTIONS", payload: transactions })
      }
    } catch (error) {
      console.error("Failed to load transactions from localStorage:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions))
      } catch (error) {
        console.error("Failed to save transactions to localStorage:", error)
      }
    }
  }, [state.transactions, state.isLoading])

  const addTransaction = (transaction: Transaction) => {
    dispatch({ type: "ADD_TRANSACTION", payload: transaction })
  }

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    dispatch({ type: "UPDATE_TRANSACTION", payload: { id, transaction } })
  }

  const deleteTransaction = (id: string) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id })
  }

  const setTransactions = (transactions: Transaction[]) => {
    dispatch({ type: "SET_TRANSACTIONS", payload: transactions })
  }

  const contextValue: TransactionContextType = {
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setTransactions
  }

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}
