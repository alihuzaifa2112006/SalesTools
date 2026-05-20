"use client";

import { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import { SalesChart, SourceChart } from "@/components/dashboard/Charts";
import Card from "@/components/ui/Card";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads/stats", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-neutral-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
          Dashboard
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500">
          Your sales cockpit — Tricon Studios Marketing & Sales
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Leads"
          value={stats?.totalLeads ?? 0}
          icon={Users}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${stats?.conversionRate ?? 0}%`}
          icon={TrendingUp}
          subtitle="Deals closed / total leads"
        />
        <MetricCard
          title="Pending Payments"
          value={formatCurrency(stats?.pendingPayments ?? 0)}
          icon={DollarSign}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          icon={DollarSign}
          subtitle="Payments received"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">
                Monthly Sales Velocity
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Revenue and new leads over time
              </p>
            </div>
          </div>
          <SalesChart data={stats?.monthlySales ?? []} />
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-neutral-900 mb-1">
            Leads by Source
          </h2>
          <p className="text-xs text-neutral-400 mb-4">
            Distribution across platforms
          </p>
          <SourceChart data={stats?.leadsBySource ?? []} />
          <div className="mt-4 space-y-2">
            {(stats?.leadsBySource ?? []).map((s, i) => (
              <div key={s.source} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-neutral-600">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: ["#171717", "#525252", "#737373", "#a3a3a3"][i % 4],
                    }}
                  />
                  {s.source}
                </span>
                <span className="font-medium text-neutral-900">{s.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-neutral-900">
              Upcoming Follow-Ups
            </h2>
            <Link
              href="/dashboard/leads"
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {(stats as DashboardStats & { upcomingFollowUps?: { id: string; clientName: string; nextFollowUpAt: string; status: string }[] })?.upcomingFollowUps?.length ? (
            <div className="space-y-3">
              {(stats as DashboardStats & { upcomingFollowUps: { id: string; clientName: string; nextFollowUpAt: string; status: string }[] }).upcomingFollowUps.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {item.clientName}
                      </p>
                      <p className="text-xs text-neutral-400 capitalize">
                        {item.status.replace("_", " ")}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate(item.nextFollowUpAt)}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 py-8 text-center">
              No upcoming follow-ups scheduled
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-neutral-900 mb-4">
            Pipeline Overview
          </h2>
          <div className="space-y-3">
            {[
              { label: "New", key: "new", color: "bg-slate-400" },
              { label: "In Conversation", key: "in_conversation", color: "bg-blue-400" },
              { label: "Follow-Up Scheduled", key: "follow_up_scheduled", color: "bg-amber-400" },
              { label: "Deal Closed", key: "deal_closed", color: "bg-emerald-400" },
              { label: "Lost", key: "lost", color: "bg-red-400" },
            ].map((stage) => {
              const count =
                (stats as DashboardStats & { statusBreakdown?: Record<string, number> })
                  ?.statusBreakdown?.[stage.key] ?? 0;
              const total = stats?.totalLeads || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-600">{stage.label}</span>
                    <span className="font-medium text-neutral-900">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
