"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Copy, Check, Link2 } from "lucide-react";

export default function SettingsPage() {
  const { user, workspaces } = useAuth();
  const activeWorkspace = workspaces.find((w) => w.id === user?.activeWorkspaceId);
  const [inviteUrl, setInviteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateInvite = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/invite`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.inviteUrl) setInviteUrl(data.inviteUrl);
    } finally {
      setLoading(false);
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
          Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500">
          Manage your workspace and team invitations
        </p>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-neutral-900 mb-4">
          Profile
        </h2>
        <div className="space-y-4">
          <Input label="Name" value={user?.name || ""} disabled />
          <Input label="Email" value={user?.email || ""} disabled />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-neutral-900 mb-1">
          Active Workspace
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          {activeWorkspace?.name || "No workspace selected"}
        </p>

        <div className="border-t border-neutral-100 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-medium text-neutral-700">
              Invite Team Members
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            Generate an invite link valid for 7 days. Share it with your team to
            collaborate on leads.
          </p>

          {inviteUrl ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={inviteUrl}
                readOnly
                className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-xs text-neutral-600 bg-neutral-50"
              />
              <Button variant="secondary" onClick={copyInvite} className="w-full sm:w-auto shrink-0">
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={generateInvite} loading={loading}>
              Generate Invite Link
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-neutral-900 mb-4">
          Your Workspaces
        </h2>
        <div className="space-y-2">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="flex flex-col gap-2 rounded-xl border border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">{ws.name}</p>
                <p className="text-xs text-neutral-400 capitalize">{ws.role}</p>
              </div>
              {ws.id === user?.activeWorkspaceId && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
