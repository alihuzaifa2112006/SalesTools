import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Workspace from "@/models/Workspace";
import User from "@/models/User";
import {
  getAuthenticatedUser,
  jsonError,
  jsonSuccess,
  AuthError,
} from "@/lib/auth/session";
import { joinWorkspaceSchema, zodFirstError } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();
    const parsed = joinWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(zodFirstError(parsed.error), 400);
    }

    await connectDB();

    const workspace = await Workspace.findOne({
      inviteToken: parsed.data.inviteToken,
    }).select("+inviteToken +inviteExpiresAt");

    if (!workspace) {
      return jsonError("Invalid or expired invitation", 404);
    }

    if (workspace.inviteExpiresAt && workspace.inviteExpiresAt < new Date()) {
      return jsonError("Invitation has expired", 410);
    }

    const alreadyMember = workspace.members.some(
      (m) => m.userId.toString() === user._id.toString()
    );

    if (!alreadyMember) {
      workspace.members.push({
        userId: user._id,
        role: "member",
        joinedAt: new Date(),
      });
      await workspace.save();
    }

    await User.findByIdAndUpdate(user._id, {
      activeWorkspaceId: workspace._id,
    });

    return jsonSuccess({
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    return jsonError("Failed to join workspace", 500);
  }
}
