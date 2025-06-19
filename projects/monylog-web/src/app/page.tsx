"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { UserContext, useUser } from "@/contexts/user-context"; // Changed from useAuth to useUser
import Dashboard from "@/components/dashboard"
import { useContext, useEffect } from "react"
import { ChatInput } from "@/components/chat-input";
import { ExpenseViewList } from "@/components/transaction-list";
import { useExpenses } from "@/contexts/expenses-context";

export default function Home() {
  const router = useRouter()
  // const { user, isLoading } = useUser(); 
  const context = useContext(UserContext);

  useEffect(() => {
    if (!context?.isLoading && !context?.user) { // Check isLoading and user
      router.push("/login")
    }
  }, [context?.user, context?.isLoading, router]) // Dependency array updated

  if (context?.isLoading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>
  }

  if (!context?.user) { // Check user
    return null // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }
  const defaultHandleChatSubmit = () => { }
  const { expenses } = useExpenses()

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
