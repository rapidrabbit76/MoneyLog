"use client";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme/toggle";
import { UserStatus } from "@/components/user-status";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";

export function AppHeader() {
  const pathName = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  if (pathName === "/login" || pathName === "/register") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center border-b bg-card px-4 shadow-sm lg:px-6">
      <div className="flex items-center gap-4">
        <Logo />
        <h1 className="text-xl font-bold">가계부 챗</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        <UserStatus user={user} onLogout={handleLogout} />
      </div>
    </header>
  );
}
