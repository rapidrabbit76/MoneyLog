"use client";

import { useUserStore } from "@/store/user-store";

export function useAuth() {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const logout = useUserStore((state) => state.logout);

  return {
    user,
    loading: isLoading,
    logout,
    isAuthenticated: !!user,
  };
}
