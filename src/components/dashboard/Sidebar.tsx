"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Building2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Button from "@/components/ui/Button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Lead Tracker", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, workspaces, logout, switchWorkspace } = useAuth();
  const [wsOpen, setWsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newWsName, setNewWsName] = useState("");

  const activeWorkspace = workspaces.find((w) => w.id === user?.activeWorkspaceId);

  const handleCreateWorkspace = async () => {
    if (!newWsName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newWsName }),
      });
      if (res.ok) {
        setNewWsName("");
        window.location.reload();
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-neutral-200/80 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 border-b border-neutral-200/80 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Saller</p>
          <p className="text-[10px] text-neutral-400">Tricon Studios</p>
        </div>
      </div>

      <div className="relative px-4 py-4">
        <button
          onClick={() => setWsOpen(!wsOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-left transition hover:bg-neutral-100/80"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 shrink-0 text-neutral-500" />
            <span className="truncate text-sm font-medium text-neutral-800">
              {activeWorkspace?.name || "Select Workspace"}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-neutral-400 transition",
              wsOpen && "rotate-180"
            )}
          />
        </button>

        {wsOpen && (
          <div className="absolute left-4 right-4 top-full z-50 mt-1 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg shadow-neutral-900/5">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  switchWorkspace(ws.id);
                  setWsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-sm transition",
                  ws.id === user?.activeWorkspaceId
                    ? "bg-neutral-100 font-medium text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {ws.name}
              </button>
            ))}
            <div className="mt-2 border-t border-neutral-100 pt-2">
              <div className="flex gap-1">
                <input
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="New workspace"
                  className="flex-1 rounded-lg border border-neutral-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-300"
                />
                <Button size="sm" onClick={handleCreateWorkspace} loading={creating}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200/80 p-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">{user?.name}</p>
            <p className="truncate text-xs text-neutral-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
