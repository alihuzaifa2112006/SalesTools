"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />

      <nav className="relative z-50 flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 max-w-6xl mx-auto safe-top">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 shadow-lg shadow-neutral-900/20">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <div className="min-w-0">
            <span className="text-base sm:text-lg font-semibold text-neutral-900">Saller</span>
            <span className="hidden sm:inline ml-2 text-xs text-neutral-400">by Tricon Studios</span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white/80 sm:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-[100dvh] w-[min(100vw-2rem,16rem)] flex-col gap-2 border-l border-neutral-200 bg-white p-4 pt-16 shadow-xl transition-transform duration-300 sm:hidden safe-top safe-bottom",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <Link href="/login" onClick={() => setOpen(false)}>
          <Button variant="secondary" className="w-full">
            Sign in
          </Button>
        </Link>
        <Link href="/register" onClick={() => setOpen(false)}>
          <Button className="w-full">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </>
  );
}
