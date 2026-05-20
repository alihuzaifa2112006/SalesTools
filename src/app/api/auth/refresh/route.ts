import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { getRefreshTokenFromCookies, setAuthCookies } from "@/lib/auth/cookies";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { jsonError } from "@/lib/auth/session";

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookies();

    if (!refreshToken) {
      return jsonError("No refresh token", 401);
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return jsonError("Invalid refresh token", 401);
    }

    await connectDB();
    const user = await User.findById(payload.userId).select("+refreshTokenHash");

    if (!user?.refreshTokenHash) {
      return jsonError("Session expired", 401);
    }

    const { verifyPassword } = await import("@/lib/auth/password");
    const isValid = await verifyPassword(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      return jsonError("Invalid refresh token", 401);
    }

    const newPayload = {
      userId: user._id.toString(),
      email: user.email,
      workspaceId: user.activeWorkspaceId?.toString(),
    };

    const accessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);
    user.refreshTokenHash = await hashPassword(newRefreshToken);
    await user.save();

    const response = NextResponse.json({ success: true });
    return setAuthCookies(response, accessToken, newRefreshToken);
  } catch (error) {
    console.error("Refresh error:", error);
    return jsonError("Token refresh failed", 500);
  }
}
