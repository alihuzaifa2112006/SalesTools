import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Workspace from "@/models/Workspace";
import {
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
} from "@/lib/auth/cookies";
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
} from "@/lib/auth/jwt";
import type { JWTPayload } from "@/types";

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function getAuthPayload(): Promise<JWTPayload> {
  const accessToken = await getAccessTokenFromCookies();

  if (accessToken) {
    try {
      return verifyAccessToken(accessToken);
    } catch {
      // Fall through to refresh
    }
  }

  throw new AuthError("Unauthorized");
}

export async function getAuthenticatedUser() {
  await connectDB();
  const payload = await getAuthPayload();
  const user = await User.findById(payload.userId).select("-passwordHash -refreshTokenHash");

  if (!user) {
    throw new AuthError("User not found");
  }

  return user;
}

export async function requireWorkspaceAccess(
  userId: string,
  workspaceId: string
) {
  await connectDB();
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new AuthError("Workspace not found", 404);
  }

  const isMember = workspace.members.some(
    (m) => m.userId.toString() === userId
  );

  if (!isMember) {
    throw new AuthError("Access denied to workspace", 403);
  }

  return workspace;
}

export function jsonError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

export function jsonSuccess<T>(data: T, status: number = 200) {
  return Response.json(data, { status });
}

export async function tryRefreshAccessToken(
  request: NextRequest
): Promise<string | null> {
  const refreshToken =
    request.cookies.get("saller_refresh_token")?.value ||
    (await getRefreshTokenFromCookies());

  if (!refreshToken) return null;

  try {
    const payload = verifyRefreshToken(refreshToken);
    await connectDB();
    const user = await User.findById(payload.userId).select("+refreshTokenHash");

    if (!user?.refreshTokenHash) return null;

    const { verifyPassword } = await import("@/lib/auth/password");
    const isValid = await verifyPassword(refreshToken, user.refreshTokenHash);
    if (!isValid) return null;

    return signAccessToken({
      userId: payload.userId,
      email: payload.email,
      workspaceId: user.activeWorkspaceId?.toString(),
    });
  } catch {
    return null;
  }
}
