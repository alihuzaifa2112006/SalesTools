import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Workspace from "@/models/Workspace";
import {
  getAuthenticatedUser,
  jsonError,
  jsonSuccess,
  AuthError,
} from "@/lib/auth/session";
import { workspaceSchema, zodFirstError } from "@/lib/validations";
import { slugify, generateInviteToken } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    const workspaces = await Workspace.find({
      "members.userId": user._id,
    }).select("name slug description ownerId members createdAt updatedAt");

    return jsonSuccess({
      workspaces: workspaces.map((ws) => ({
        id: ws._id.toString(),
        name: ws.name,
        slug: ws.slug,
        description: ws.description,
        role: ws.members.find((m) => m.userId.toString() === user._id.toString())?.role,
        memberCount: ws.members.length,
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    return jsonError("Failed to fetch workspaces", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();
    const parsed = workspaceSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(zodFirstError(parsed.error), 400);
    }

    await connectDB();

    let slug = slugify(parsed.data.name);
    const slugExists = await Workspace.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const workspace = await Workspace.create({
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      ownerId: user._id,
      members: [{ userId: user._id, role: "owner", joinedAt: new Date() }],
      inviteToken: generateInviteToken(),
      inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await User.findByIdAndUpdate(user._id, {
      activeWorkspaceId: workspace._id,
    });

    return jsonSuccess(
      {
        workspace: {
          id: workspace._id.toString(),
          name: workspace.name,
          slug: workspace.slug,
          description: workspace.description,
        },
      },
      201
    );
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    return jsonError("Failed to create workspace", 500);
  }
}
