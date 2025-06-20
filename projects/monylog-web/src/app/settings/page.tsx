"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SettingsPanel } from "@/components/settings-panel"
import { useUserStore } from '@/store/user-store';

export default function SettingsRoutePage() {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const logout = useUserStore((state) => state.logout);
  const router = useRouter();

  // useEffect(() => {
  //   if (hasHydrated && !isLoading && !user) {
  //     router.push("/login");
  //   }
  // }, [user, isLoading, hasHydrated, router]);

  if (!hasHydrated) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <SettingsPanel user={user} onLogout={handleLogout} />
  );
}
