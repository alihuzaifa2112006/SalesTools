"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardHeader() {
  const { toggle } = useSidebar();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 flex items-center justify-between gap-3 border-b border-neutral-200/60 bg-white/70 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden safe-top">
      <button
        onClick={toggle}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-50"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-semibold text-neutral-900">Saller</p>
        <p className="truncate text-[10px] text-neutral-400">
          {user?.name || "Tricon Studios"}
        </p>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
        {user?.name?.charAt(0).toUpperCase()}
      </div>
    </header>
  );
}
