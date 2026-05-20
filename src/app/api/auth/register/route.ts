import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Workspace from "@/models/Workspace";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { registerSchema, zodFirstError } from "@/lib/validations";
import { slugify, generateInviteToken } from "@/lib/utils";
import { jsonError } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(zodFirstError(parsed.error), 400);
    }

    const { name, email, password, workspaceName } = parsed.data;

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return jsonError("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const wsName = workspaceName || `${name.split(" ")[0]}'s Workspace`;
    let slug = slugify(wsName);
    const slugExists = await Workspace.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    const workspace = await Workspace.create({
      name: wsName,
      slug,
      ownerId: user._id,
      members: [{ userId: user._id, role: "owner", joinedAt: new Date() }],
      inviteToken: generateInviteToken(),
      inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    user.activeWorkspaceId = workspace._id;
    await user.save();

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      workspaceId: workspace._id.toString(),
    };

    const accessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);
    user.refreshTokenHash = await hashPassword(newRefreshToken);
    await user.save();

    const response = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          activeWorkspaceId: workspace._id.toString(),
        },
        workspace: {
          id: workspace._id.toString(),
          name: workspace.name,
          slug: workspace.slug,
        },
      },
      { status: 201 }
    );

    return setAuthCookies(response, accessToken, newRefreshToken);
  } catch (error) {
    console.error("Register error:", error);
    return jsonError("Registration failed. Please try again.", 500);
  }
}
