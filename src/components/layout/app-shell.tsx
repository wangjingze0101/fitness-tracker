"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";

interface AppShellProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({
  title,
  showBack,
  backHref,
  rightAction,
  children,
}: AppShellProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 顶部栏 */}
      {title && (
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-2xl mx-auto flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-2 min-w-0">
              {showBack && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => (backHref ? router.push(backHref) : router.back())}
                  className="p-1.5 -ml-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              )}
              <h1 className="text-lg font-semibold truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-1">
              {rightAction}
              <ThemeToggle />
            </div>
          </div>
        </header>
      )}

      {/* 主内容区 */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  );
}
