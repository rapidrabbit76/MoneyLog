// zustand store: 사용자 인증/정보 등 도메인 상태만 관리합니다.
// UI/임시 상태는 context 또는 로컬 state로 관리하세요.
// hydration(SSR/CSR) 처리는 hasHydrated로 일관성 있게 적용합니다.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/auth";
import { getCurrentUser, logout as logoutUser } from "@/lib/api/auth";
import { toast } from "@/hooks/use-toast";

interface UserState {
  user: User | null;
  isLoading: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

// hasHydrated: zustand persist의 hydration(스토리지에서 상태 복원)이 완료되면 true가 됩니다.
// CSR 환경에서만 의미가 있으며, 인증 체크는 hasHydrated가 true일 때만 신뢰할 수 있습니다.
// AuthGuard 등에서 hasHydrated를 활용해 인증 상태 race condition을 방지하세요.

export const useUserStore = create<UserState>()(
  persist(
    (set, get, store) => ({
      user: null,
      isLoading: false,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const currentUser = await getCurrentUser();
          set({ user: currentUser });
        } catch (error) {
          set({ user: null });
          toast({
            title: "사용자 정보 불러오기 실패",
            description:
              error instanceof Error
                ? error.message
                : "알 수 없는 에러가 발생했습니다.",
            variant: "destructive",
          });
        } finally {
          set({ isLoading: false });
        }
      },
      logout: async () => {
        try {
          set({ user: null });
          await logoutUser();
          // localStorage의 user-storage 키도 삭제
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("user-storage");
          }
          window.location.href = "/login"; // 로그아웃 후 로그인 페이지로 리다이렉트
        } catch (error) {
          toast({
            title: "로그아웃 실패",
            description:
              error instanceof Error
                ? error.message
                : "알 수 없는 에러가 발생했습니다.",
            variant: "destructive",
          });
        }
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
