import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';
import { getCurrentUser, logout as logoutUser } from '@/lib/api/auth';

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
                } finally {
                    set({ isLoading: false });
                }
            },
            logout: async () => {
                await logoutUser();
                set({ user: null });
                // localStorage의 user-storage 키도 삭제
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('user-storage');
                }
                window.location.href = '/login'; // 로그아웃 후 로그인 페이지로 리다이렉트
            },
        }),
        {
            name: 'user-storage',
            partialize: (state) => ({ user: state.user }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
