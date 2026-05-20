import connectDB from "@/lib/db/mongodb";
import Lead from "@/models/Lead";
import {
  getAuthenticatedUser,
  requireWorkspaceAccess,
  jsonError,
  jsonSuccess,
  AuthError,
} from "@/lib/auth/session";
import { LEAD_SOURCES } from "@/types";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    if (!user.activeWorkspaceId) {
      return jsonError("No active workspace selected", 400);
    }

    const workspaceId = user.activeWorkspaceId.toString();
    await requireWorkspaceAccess(user._id.toString(), workspaceId);

    const leads = await Lead.find({ workspaceId }).lean();

    const totalLeads = leads.length;
    const closedDeals = leads.filter((l) => l.status === "deal_closed").length;
    const conversionRate = totalLeads > 0 ? (closedDeals / totalLeads) * 100 : 0;

    const pendingPayments = leads
      .filter((l) => ["pending", "partial", "overdue"].includes(l.paymentStatus))
      .reduce((sum, l) => sum + Math.max(0, l.totalValue - l.paymentReceived), 0);

    const totalRevenue = leads.reduce((sum, l) => sum + l.paymentReceived, 0);

    const sourceCounts: Record<string, number> = {};
    leads.forEach((l) => {
      sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
    });

    const leadsBySource = LEAD_SOURCES.map((s) => ({
      source: s.label,
      count: sourceCounts[s.value] || 0,
    })).filter((s) => s.count > 0);

    const monthlyMap: Record<string, { revenue: number; leads: number }> = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      monthlyMap[key] = { revenue: 0, leads: 0 };
    }

    leads.forEach((l) => {
      const d = new Date(l.createdAt);
      const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      if (monthlyMap[key]) {
        monthlyMap[key].revenue += l.paymentReceived;
        monthlyMap[key].leads += 1;
      }
    });

    const monthlySales = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      ...data,
    }));

    const statusBreakdown = {
      new: leads.filter((l) => l.status === "new").length,
      in_conversation: leads.filter((l) => l.status === "in_conversation").length,
      follow_up_scheduled: leads.filter((l) => l.status === "follow_up_scheduled").length,
      deal_closed: closedDeals,
      lost: leads.filter((l) => l.status === "lost").length,
    };

    const upcomingFollowUps = leads
      .filter((l) => l.nextFollowUpAt && new Date(l.nextFollowUpAt) >= new Date())
      .sort(
        (a, b) =>
          new Date(a.nextFollowUpAt!).getTime() - new Date(b.nextFollowUpAt!).getTime()
      )
      .slice(0, 5)
      .map((l) => ({
        id: l._id.toString(),
        clientName: l.clientName,
        nextFollowUpAt: l.nextFollowUpAt,
        status: l.status,
      }));

    return jsonSuccess({
      stats: {
        totalLeads,
        conversionRate: Math.round(conversionRate * 10) / 10,
        pendingPayments,
        totalRevenue,
        leadsBySource,
        monthlySales,
        statusBreakdown,
        upcomingFollowUps,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, error.status);
    console.error("Stats error:", error);
    return jsonError("Failed to fetch stats", 500);
  }
}
