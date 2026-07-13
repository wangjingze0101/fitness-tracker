import { NextRequest, NextResponse } from "next/server";
import { hashPassword, createToken, isValidEmail } from "@/lib/auth";
import { createUser, getUserByEmail } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    }

    const existing = await getUserByEmail(email.trim().toLowerCase());
    if (existing) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
    }

    const hash = await hashPassword(password);
    const user = await createUser(email.trim().toLowerCase(), hash, name?.trim() || email.split("@")[0]);
    const token = await createToken(user.id);

    const res = NextResponse.json({ user, token }, { status: 201 });
    res.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 7 * 86400, path: "/" });
    return res;
  } catch (err) {
    console.error("注册失败:", err);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
