import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import {
  getAuthenticatedUser,
  requireWorkspaceAccess,
  jsonError,
  jsonSuccess,
  AuthError,
} from "@/lib/auth/session";
import { signAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import {
  getRefreshTokenFromCookies,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/cookies";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    await requireWorkspaceAccess(user._id.toString(), params.id);

    await connectDB();
    await User.findByIdAndUpdate(user._id, {
      activeWorkspaceId: params.id,
    });

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      workspaceId: params.id,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = (await getRefreshTokenFromCookies()) || "";

    const responseBody = { success: true, activeWorkspaceId: params.id };

    if (refreshToken) {
      try {
        verifyRefreshToken(refreshToken);
        const response = NextResponse.json(responseBody);
        const isProduction = process.env.NODE_ENV === "production";
        response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "strict",
          path: "/",
          maxAge: 15 * 60,
        });
        response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "strict",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
        return response;
      } catch {
        // Return without updating cookies
      }
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    return jsonError("Failed to switch workspace", 500);
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    const workspace = await requireWorkspaceAccess(user._id.toString(), params.id);

    const members = await User.find({
      _id: { $in: workspace.members.map((m) => m.userId) },
    }).select("name email avatar");

    return jsonSuccess({
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        members: workspace.members.map((m) => {
          const member = members.find((u) => u._id.toString() === m.userId.toString());
          return {
            userId: m.userId.toString(),
            role: m.role,
            name: member?.name,
            email: member?.email,
            avatar: member?.avatar,
          };
        }),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    return jsonError("Failed to fetch workspace", 500);
  }
}
