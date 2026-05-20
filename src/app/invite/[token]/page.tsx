"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inviteToken: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join");
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join workspace");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] mesh-gradient flex items-center justify-center">
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] mesh-gradient flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md text-center rounded-2xl border border-neutral-200/80 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
          <h1 className="text-xl font-semibold text-neutral-900">
            Workspace Invitation
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Sign in or create an account to join this workspace.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href={`/login?redirect=/invite/${token}`} className="w-full sm:w-auto">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href={`/register`} className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">Register</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] mesh-gradient flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md text-center rounded-2xl border border-neutral-200/80 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
        {success ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-xl">✓</span>
            </div>
            <h1 className="mt-4 text-xl font-semibold text-neutral-900">
              Welcome to the team!
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Redirecting to dashboard...
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-neutral-900">
              Join Workspace
            </h1>
            <p className="mt-3 text-sm text-neutral-500">
              You&apos;ve been invited to collaborate on Saller as{" "}
              <strong>{user.name}</strong>.
            </p>
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <Button className="mt-6 w-full sm:w-auto" onClick={handleJoin} loading={loading}>
              Accept Invitation
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
