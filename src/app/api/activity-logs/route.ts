import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import ActivityLog from "@/models/ActivityLog";
import Lead from "@/models/Lead";
import User from "@/models/User";
import {
  getAuthenticatedUser,
  requireWorkspaceAccess,
  jsonError,
  jsonSuccess,
  AuthError,
} from "@/lib/auth/session";
import { activityLogSchema, zodFirstError } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    if (!user.activeWorkspaceId) {
      return jsonError("No active workspace selected", 400);
    }

    const workspaceId = user.activeWorkspaceId.toString();
    await requireWorkspaceAccess(user._id.toString(), workspaceId);

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    const filter: Record<string, unknown> = { workspaceId: user.activeWorkspaceId };
    if (leadId) filter.leadId = leadId;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const userIds = Array.from(new Set(logs.map((l) => l.userId.toString())));
    const users = await User.find({ _id: { $in: userIds } }).select("name").lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));

    return jsonSuccess({
      logs: logs.map((log) => ({
        ...log,
        _id: log._id.toString(),
        userName: userMap.get(log.userId.toString()),
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    return jsonError("Failed to fetch activity logs", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    if (!user.activeWorkspaceId) {
      return jsonError("No active workspace selected", 400);
    }

    const body = await request.json();
    const parsed = activityLogSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(zodFirstError(parsed.error), 400);
    }

    const lead = await Lead.findById(parsed.data.leadId);
    if (!lead) return jsonError("Lead not found", 404);

    await requireWorkspaceAccess(
      user._id.toString(),
      lead.workspaceId.toString()
    );

    const log = await ActivityLog.create({
      workspaceId: lead.workspaceId,
      leadId: parsed.data.leadId,
      userId: user._id,
      type: parsed.data.type,
      content: parsed.data.content,
      metadata: parsed.data.metadata,
    });

    await Lead.findByIdAndUpdate(parsed.data.leadId, {
      lastContactedBy: user._id,
      lastContactedAt: new Date(),
    });

    return jsonSuccess(
      { log: { ...log.toObject(), _id: log._id.toString(), userName: user.name } },
      201
    );
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    return jsonError("Failed to create activity log", 500);
  }
}
