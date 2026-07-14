"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Dumbbell, TrendingUp, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

interface UserRow {
  id: string; email: string; name: string; createdAt: string;
  actions: number; records: number; totalSets: number; bodyMetrics: number;
}

interface UserDetail {
  actions: { id: string; name: string; sortOrder: number }[];
  records: { id: string; actionName: string; date: string; sets: number; reps: number }[];
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.status === 403) { setError("你不是管理员"); setLoading(false); return; }
      const d = await res.json();
      setUsers(d.users || []);
    } catch { setError("加载失败"); }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const viewUser = async (user: UserRow) => {
    setSelected(user);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { credentials: "include" });
      const d = await res.json();
      setDetail(d);
    } catch { setDetail(null); }
  };

  if (error) {
    return (
      <AppShell title="管理后台" showBack backHref="/">
        <div className="text-center py-20 text-muted-foreground">{error}</div>
      </AppShell>
    );
  }

  if (selected) {
    return (
      <AppShell title={selected.name + " 的数据"} showBack backHref="/admin" rightAction={
        <button onClick={() => setSelected(null)} className="text-xs text-primary">返回用户列表</button>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="动作数" value={selected.actions} />
            <Stat label="记录数" value={selected.records} />
            <Stat label="总组数" value={selected.totalSets} />
          </div>
          {detail && (
            <>
              <div className="rounded-xl bg-card border p-4">
                <h3 className="text-sm font-semibold mb-2">训练动作</h3>
                {detail.actions.map(a => <p key={a.id} className="text-sm text-muted-foreground py-1">{a.name}</p>)}
              </div>
              <div className="rounded-xl bg-card border p-4">
                <h3 className="text-sm font-semibold mb-2">最近记录（前100条）</h3>
                {detail.records.slice(0, 50).map(r => (
                  <div key={r.id} className="flex justify-between text-sm py-1 border-b border-border/50">
                    <span>{r.actionName}</span>
                    <span className="text-muted-foreground">{r.date} · {r.sets}组×{r.reps}次</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="管理后台">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="总用户数" value={users.length} />
          <Stat label="总组数" value={users.reduce((s,u) => s + u.totalSets, 0)} />
          <Stat label="总记录数" value={users.reduce((s,u) => s + u.records, 0)} />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">加载中...</div>
        ) : (
          users.map((user) => (
            <motion.button
              key={user.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => viewUser(user)}
              className="w-full p-4 rounded-xl bg-card border text-left flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user.actions}个动作 · {user.totalSets}组 · 注册于 {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          ))
        )}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded-xl bg-card border text-center">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
