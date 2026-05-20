import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Lead from "@/models/Lead";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import {
  getAuthenticatedUser,
  requireWorkspaceAccess,
  jsonError,
  jsonSuccess,
  AuthError,
} from "@/lib/auth/session";
import { leadSchema, zodFirstError } from "@/lib/validations";
import { derivePaymentStatus } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    if (!user.activeWorkspaceId) {
      return jsonError("No active workspace selected", 400);
    }

    await requireWorkspaceAccess(
      user._id.toString(),
      user.activeWorkspaceId.toString()
    );

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const country = searchParams.get("country") || "";
    const source = searchParams.get("source") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      workspaceId: user.activeWorkspaceId,
    };

    if (country) filter.country = { $regex: country, $options: "i" };
    if (source) filter.source = source;
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { whatsapp: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(filter),
    ]);

    const userIds = new Set<string>();
    leads.forEach((lead) => {
      if (lead.lastContactedBy) userIds.add(lead.lastContactedBy.toString());
      if (lead.assignedTo) userIds.add(lead.assignedTo.toString());
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } })
      .select("name")
      .lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));

    return jsonSuccess({
      leads: leads.map((lead) => ({
        ...lead,
        _id: lead._id.toString(),
        workspaceId: lead.workspaceId.toString(),
        assignedToName: lead.assignedTo
          ? userMap.get(lead.assignedTo.toString())
          : undefined,
        lastContactedByName: lead.lastContactedBy
          ? userMap.get(lead.lastContactedBy.toString())
          : undefined,
        remainingBalance: Math.max(0, lead.totalValue - lead.paymentReceived),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    console.error("Leads GET error:", error);
    return jsonError("Failed to fetch leads", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    if (!user.activeWorkspaceId) {
      return jsonError("No active workspace selected", 400);
    }

    await requireWorkspaceAccess(
      user._id.toString(),
      user.activeWorkspaceId.toString()
    );

    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(zodFirstError(parsed.error), 400);
    }

    const data = parsed.data;
    const totalValue = data.totalValue ?? 0;
    const paymentReceived = data.paymentReceived ?? 0;

    const lead = await Lead.create({
      workspaceId: user.activeWorkspaceId,
      clientName: data.clientName,
      email: data.email || undefined,
      phone: data.phone,
      whatsapp: data.whatsapp,
      socialLinks: data.socialLinks,
      source: data.source,
      country: data.country,
      city: data.city,
      status: data.status || "new",
      totalValue,
      paymentReceived,
      paymentStatus: derivePaymentStatus(totalValue, paymentReceived),
      assignedTo: data.assignedTo || user._id,
      createdBy: user._id,
      nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : undefined,
      notes: data.notes,
    });

    await ActivityLog.create({
      workspaceId: user.activeWorkspaceId,
      leadId: lead._id,
      userId: user._id,
      type: "note",
      content: `Lead created: ${data.clientName}`,
    });

    return jsonSuccess({ lead: { ...lead.toObject(), _id: lead._id.toString() } }, 201);
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    console.error("Leads POST error:", error);
    return jsonError("Failed to create lead", 500);
  }
}
