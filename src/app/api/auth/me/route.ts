import connectDB from "@/lib/db/mongodb";
import Workspace from "@/models/Workspace";
import {
  getAuthenticatedUser,
  jsonError,
  jsonSuccess,
  AuthError,
} from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    const workspaces = await Workspace.find({
      "members.userId": user._id,
    }).select("name slug description ownerId members createdAt");

    return jsonSuccess({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        activeWorkspaceId: user.activeWorkspaceId?.toString(),
      },
      workspaces: workspaces.map((ws) => ({
        id: ws._id.toString(),
        name: ws.name,
        slug: ws.slug,
        description: ws.description,
        role: ws.members.find((m) => m.userId.toString() === user._id.toString())?.role,
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("Me error:", error);
    return jsonError("Failed to fetch user", 500);
  }
}
