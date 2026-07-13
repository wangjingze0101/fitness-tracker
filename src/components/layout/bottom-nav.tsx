"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  BarChart3,
  Calendar,
  User,
  Settings,
} from "lucide-react";

const tabs = [
  { href: "/", label: "首页", icon: Home },
  { href: "/stats", label: "统计", icon: BarChart3 },
  { href: "/calendar", label: "日历", icon: Calendar },
  { href: "/body", label: "身体", icon: User },
  { href: "/settings", label: "设置", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  // 判断当前路径是否匹配（支持子路径）
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              {/* 活跃指示器 */}
              {active && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute -top-0.5 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
