"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomNav } from "./bottom-nav";
import { fetchMe, logout } from "@/lib/api";
import { LogOut, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

const AUTH_PAGES = ["/login", "/register"];

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const isAuthPage = AUTH_PAGES.includes(pathname);

  useEffect(() => {
    fetchMe().then((d) => {
      if (d.user) setUser(d.user);
      else if (!isAuthPage) router.push("/login");
      setLoaded(true);
    });
  }, [pathname]);

  async function handleLogout() {
    await logout();
    setUser(null);
    router.push("/login");
  }

  // 登录/注册页：不显示底部导航
  if (isAuthPage) return <>{children}</>;

  // 未加载完成：空白
  if (!loaded) return <div className="min-h-screen bg-background" />;

  // 未登录：不显示（已经在 useEffect 中跳转）
  if (!user) return null;

  return (
    <>
      {children}
      <BottomNav />
      {/* 用户信息栏（PC端顶部，移动端不显示） */}
      <div className="hidden md:flex fixed top-3 right-4 items-center gap-2 z-50">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <UserIcon className="w-3 h-3" />
          {user.name}
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          退出
        </motion.button>
      </div>
    </>
  );
}
