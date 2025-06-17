"use client"

import { useUser } from "@/contexts/user-context";

export function useAuth() {
  const { user, isLoading, logout } = useUser();

  return {
    user,
    loading: isLoading,
    logout,
    isAuthenticated: !!user,
  };
}
