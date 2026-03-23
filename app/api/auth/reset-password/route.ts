import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const password =
      typeof body?.password === "string" ? body.password.trim() : "";

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const nowUnix = Math.floor(Date.now() / 1000);

    const user = await db.user.findFirst({
      where: {
        verificationToken: hashedToken,
        token: {
          gt: nowUnix,
        },
      },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "This reset link is invalid or expired." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        verificationToken: null,
        token: null,
      },
    });

    return NextResponse.json(
      { message: "Password reset successful. You can now sign in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
