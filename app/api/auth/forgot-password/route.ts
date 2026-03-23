import crypto from "crypto";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/brevo";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const SUCCESS_MESSAGE =
  "If an account exists for this email, a reset link has been sent.";

function getBaseUrl(request: Request) {
  const configured =
    process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  const fallback = new URL(request.url).origin;
  const base = configured || fallback;
  return base.replace(/\/+$/, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!user?.email) {
      return NextResponse.json({ message: SUCCESS_MESSAGE }, { status: 200 });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    const expiresAtUnix = Math.floor(expiresAt.getTime() / 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationToken: hashedToken,
        token: expiresAtUnix,
      },
    });

    const resetUrl = `${getBaseUrl(request)}/reset-password?token=${encodeURIComponent(rawToken)}`;
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      name: user.name,
    });

    return NextResponse.json({ message: SUCCESS_MESSAGE }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Failed to send reset link. Please try again." },
      { status: 500 }
    );
  }
}
