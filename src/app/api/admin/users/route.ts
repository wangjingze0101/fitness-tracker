import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getUserById } from "@/lib/storage";
import { isAdminEmail, getAllUsers, getUserStats } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const user = await getUserById(userId);
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const users = await getAllUsers();
    const usersWithStats = await Promise.all(users.map(async (u) => {
      const stats = await getUserStats(u.id);
      return { ...u, ...stats };
    }));
    return NextResponse.json({ users: usersWithStats });
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
