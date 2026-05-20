import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { loginSchema, zodFirstError } from "@/lib/validations";
import { jsonError } from "@/lib/auth/session";
import { assertEnvConfigured } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    assertEnvConfigured();

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(zodFirstError(parsed.error), 400);
    }

    const { email, password } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email }).select("+passwordHash +refreshTokenHash");
    if (!user) {
      return jsonError("Invalid email or password", 401);
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return jsonError("Invalid email or password", 401);
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      workspaceId: user.activeWorkspaceId?.toString(),
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    user.refreshTokenHash = await hashPassword(refreshToken);
    await user.save();

    const response = NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        activeWorkspaceId: user.activeWorkspaceId?.toString(),
      },
    });

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error("Login error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";

    if (msg.includes("Missing environment") || msg.includes("not configured")) {
      return jsonError(
        "Server configuration incomplete. Contact admin or check Vercel env vars.",
        503
      );
    }

    if (msg.includes("MongoServerSelectionError") || msg.includes("ECONNREFUSED")) {
      return jsonError(
        "Database connection failed. Check MongoDB Atlas network access.",
        503
      );
    }

    return jsonError("Login failed. Please try again.", 500);
  }
}
