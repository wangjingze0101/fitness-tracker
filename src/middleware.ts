import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 不需要登录的路径
const PUBLIC_PATHS = ["/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/auth/me"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只保护 /api/ 路径
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  // 公开 API 不需要登录
  if (PUBLIC_PATHS.some((p) => pathname === p)) return NextResponse.next();

  // 检查 token cookie
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
