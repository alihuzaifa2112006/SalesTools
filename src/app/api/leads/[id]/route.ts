import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Lead from "@/models/Lead";
import ActivityLog from "@/models/ActivityLog";
import {
  getAuthenticatedUser,
  requireWorkspaceAccess,
  jsonError,
  jsonSuccess,
  AuthError,
} from "@/lib/auth/session";
import { leadSchema, zodFirstError } from "@/lib/validations";
import { derivePaymentStatus } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    const lead = await Lead.findById(params.id).lean();
    if (!lead) return jsonError("Lead not found", 404);

    await requireWorkspaceAccess(user._id.toString(), lead.workspaceId.toString());

    const activities = await ActivityLog.find({ leadId: params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return jsonSuccess({
      lead: {
        ...lead,
        _id: lead._id.toString(),
        remainingBalance: Math.max(0, lead.totalValue - lead.paymentReceived),
      },
      activities: activities.map((a) => ({
        ...a,
        _id: a._id.toString(),
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    return jsonError("Failed to fetch lead", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    const existing = await Lead.findById(params.id);
    if (!existing) return jsonError("Lead not found", 404);

    await requireWorkspaceAccess(
      user._id.toString(),
      existing.workspaceId.toString()
    );

    const body = await request.json();
    const parsed = leadSchema.partial().safeParse(body);

    if (!parsed.success) {
      return jsonError(zodFirstError(parsed.error), 400);
    }

    const data = parsed.data;
    const oldStatus = existing.status;

    if (data.clientName !== undefined) existing.clientName = data.clientName;
    if (data.email !== undefined) existing.email = data.email || undefined;
    if (data.phone !== undefined) existing.phone = data.phone;
    if (data.whatsapp !== undefined) existing.whatsapp = data.whatsapp;
    if (data.socialLinks !== undefined) existing.socialLinks = data.socialLinks;
    if (data.source !== undefined) existing.source = data.source;
    if (data.country !== undefined) existing.country = data.country;
    if (data.city !== undefined) existing.city = data.city;
    if (data.status !== undefined) existing.status = data.status;
    if (data.totalValue !== undefined) existing.totalValue = data.totalValue;
    if (data.paymentReceived !== undefined) existing.paymentReceived = data.paymentReceived;
    if (data.assignedTo !== undefined) existing.assignedTo = data.assignedTo as unknown as typeof existing.assignedTo;
    if (data.notes !== undefined) existing.notes = data.notes;
    if (data.nextFollowUpAt !== undefined) {
      existing.nextFollowUpAt = data.nextFollowUpAt
        ? new Date(data.nextFollowUpAt)
        : undefined;
    }

    existing.paymentStatus = derivePaymentStatus(
      existing.totalValue,
      existing.paymentReceived
    );

    if (data.status && data.status !== oldStatus) {
      await ActivityLog.create({
        workspaceId: existing.workspaceId,
        leadId: existing._id,
        userId: user._id,
        type: "status_change",
        content: `Status changed from ${oldStatus} to ${data.status}`,
        metadata: { from: oldStatus, to: data.status },
      });
    }

    await existing.save();

    return jsonSuccess({
      lead: {
        ...existing.toObject(),
        _id: existing._id.toString(),
        remainingBalance: Math.max(0, existing.totalValue - existing.paymentReceived),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    return jsonError("Failed to update lead", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    const lead = await Lead.findById(params.id);
    if (!lead) return jsonError("Lead not found", 404);

    await requireWorkspaceAccess(
      user._id.toString(),
      lead.workspaceId.toString()
    );

    await Promise.all([
      Lead.findByIdAndDelete(params.id),
      ActivityLog.deleteMany({ leadId: params.id }),
    ]);

    return jsonSuccess({ success: true });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    return jsonError("Failed to delete lead", 500);
  }
}
