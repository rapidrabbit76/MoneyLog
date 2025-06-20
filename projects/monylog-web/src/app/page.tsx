"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from '@/store/user-store';
import { useEffect } from "react"
import { ChatInput } from "@/components/chat-input";
import { ExpenseViewList } from "@/components/expense/list";
import { useExpenses } from "@/hooks/use-expenses";

export default function Home() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const defaultHandleChatSubmit = () => { }
  const { expenses, fetchExpenses } = useExpenses();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  if (!hasHydrated) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="mb-4">
        <ChatInput onSubmit={defaultHandleChatSubmit} />
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        <ExpenseViewList expenses={expenses} />
      </div>
    </>
  )
}
