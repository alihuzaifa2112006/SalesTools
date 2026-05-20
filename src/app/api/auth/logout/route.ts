import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { getRefreshTokenFromCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { verifyRefreshToken } from "@/lib/auth/jwt";
import { jsonError } from "@/lib/auth/session";

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookies();

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        await connectDB();
        await User.findByIdAndUpdate(payload.userId, {
          $unset: { refreshTokenHash: 1 },
        });
      } catch {
        // Token invalid — still clear cookies
      }
    }

    const response = NextResponse.json({ success: true });
    return clearAuthCookies(response);
  } catch (error) {
    console.error("Logout error:", error);
    return jsonError("Logout failed", 500);
  }
}
