"use client";
import { useUserStore } from '@/store/user-store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// 인증이 필요한 경로를 정의 (로그인, 회원가입 등은 제외)
const PUBLIC_PATHS = [
    '/login',
    '/signup',
    '/_error',
    '/404',
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const user = useUserStore((state) => state.user);
    const isLoading = useUserStore((state) => state.isLoading);
    const hasHydrated = useUserStore((state) => state.hasHydrated);
    const router = useRouter();
    const pathname = usePathname();

    const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

    useEffect(() => {
        if (!isPublic && hasHydrated && !isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, hasHydrated, isPublic, router]);

    if (!hasHydrated) {
        return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
    }
    if (!isPublic && isLoading) {
        return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
    }
    if (!isPublic && !user) {
        return null;
    }
    return <>{children}</>;
}
