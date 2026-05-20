import connectDB from "@/lib/db/mongodb";
import Workspace from "@/models/Workspace";
import {
  getAuthenticatedUser,
  requireWorkspaceAccess,
  jsonError,
  jsonSuccess,
  AuthError,
} from "@/lib/auth/session";
import { generateInviteToken } from "@/lib/utils";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    const workspace = await requireWorkspaceAccess(user._id.toString(), params.id);

    const member = workspace.members.find(
      (m) => m.userId.toString() === user._id.toString()
    );

    if (!member || !["owner", "admin"].includes(member.role)) {
      return jsonError("Only owners and admins can generate invites", 403);
    }

    await connectDB();

    const inviteToken = generateInviteToken();
    await Workspace.findByIdAndUpdate(params.id, {
      inviteToken,
      inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/invite/${inviteToken}`;

    return jsonSuccess({ inviteToken, inviteUrl, expiresIn: "7 days" });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    return jsonError("Failed to generate invite", 500);
  }
}
