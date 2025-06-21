"use client";

import { useRouter } from "next/navigation";
import { SettingsPanel } from "@/components/settings-panel";
import { useUserStore } from "@/store/user-store";

export default function SettingsRoutePage() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return <SettingsPanel user={user} onLogout={handleLogout} />;
}
