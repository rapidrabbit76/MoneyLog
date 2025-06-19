"use client"

import { Button } from "@/components/ui/button"

import type React from "react"
import type { Expenses } from "@/types/expenses"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { UserStatus } from "@/components/user-status"
import { ChatInput } from "@/components/chat-input"
import { ExpenseViewList } from "@/components/transaction-list"
import { CalendarView } from "@/components/calendar-view"
import { SimpleTagManager } from "@/components/simple-category-manager"
import { ThemeToggle } from "@/components/theme-toggle"
import { parseExpense } from "@/lib/expense-message"
import { AnalyticsPage } from "@/components/analytics-page"
import { useExpenses } from "@/contexts/expenses-context"
import { SettingsPanel } from "@/components/settings-panel"

interface DashboardProps {
  // No props needed now - using Context
}

export default function Dashboard({ }: DashboardProps) {


  return (
  )
}
