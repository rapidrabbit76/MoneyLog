"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import { useEffect } from "react";
import { ChatInput } from "@/components/chat-input";
import { ExpenseViewList } from "@/components/expense/list";
import { useExpenses } from "@/hooks/use-expenses";

export default function Home() {
  const { expenses, fetchExpenses } = useExpenses();
  const defaultHandleChatSubmit = () => {};

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <>
      <div className="mb-4">
        <ChatInput onSubmit={defaultHandleChatSubmit} />
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        <ExpenseViewList expenses={expenses} />
      </div>
    </>
  );
}
