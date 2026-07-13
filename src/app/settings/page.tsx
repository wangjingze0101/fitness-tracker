"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Dumbbell, LogOut, User as UserIcon, Pencil, Check, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageTransition } from "@/components/shared/page-transition";
import { fetchMe, logout } from "@/lib/api";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); fetchMe().then(d => { setUser(d.user); if(d.user) setNewName(d.user.name); }); }, []);

  async function handleSaveName() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name: newName.trim() }), credentials: "include" });
      const d = await res.json();
      if (d.user) setUser(d.user);
    } catch {} finally { setSaving(false); setEditing(false); }
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (!mounted) return null;

  const themeOptions = [
    { value: "light", label: "浅色", icon: Sun },
    { value: "dark", label: "深色", icon: Moon },
    { value: "system", label: "跟随系统", icon: Monitor },
  ] as const;

  return (
    <AppShell title="设置">
      <PageTransition>
        {/* 用户信息 */}
        {user && (
          <div className="rounded-2xl bg-card border border-border p-5 mb-4">
            <h3 className="text-sm font-semibold mb-3">账号信息</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              {editing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditing(false); }}
                  />
                  <motion.button whileTap={{scale:0.9}} onClick={handleSaveName} disabled={saving} className="p-1.5 rounded-lg bg-primary text-primary-foreground"><Check className="w-4 h-4" /></motion.button>
                  <motion.button whileTap={{scale:0.9}} onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-muted"><X className="w-4 h-4" /></motion.button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between" onClick={() => { setNewName(user.name); setEditing(true); }}>
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <motion.button whileTap={{scale:0.9}} onClick={() => { setNewName(user.name); setEditing(true); }} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <Pencil className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="w-full mt-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </motion.button>
          </div>
        )}

        {/* 主题 */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4">
          <h3 className="text-sm font-semibold mb-4">外观</h3>
          <div className="flex gap-2">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(opt.value)}
                  className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${
                    isActive ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 关于 */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">关于</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">健身打卡</p>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            一款简洁、美观的健身打卡应用，帮助你记录每日训练，追踪身体变化，养成运动习惯。每人独立账号，数据安全隔离。
          </p>
        </div>
      </PageTransition>
    </AppShell>
  );
}
