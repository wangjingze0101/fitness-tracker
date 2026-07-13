import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createToken } from "@/lib/auth";
import { getUserByEmail } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }

    const user = await getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = await createToken(user.id);
    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name }, token });
    res.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 7 * 86400, path: "/" });
    return res;
  } catch (err) {
    console.error("登录失败:", err);
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
