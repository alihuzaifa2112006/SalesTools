import connectDB from "@/lib/db/mongodb";
import { getMissingEnvVars } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const missing = getMissingEnvVars();

  if (missing.length > 0) {
    return Response.json(
      {
        ok: false,
        error: "Missing environment variables",
        missing,
        hint: "Vercel → Project → Settings → Environment Variables → add all missing keys, then Redeploy.",
      },
      { status: 503 }
    );
  }

  try {
    await connectDB();
    return Response.json({
      ok: true,
      database: process.env.MONGODB_DB || "SalesTools",
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return Response.json(
      {
        ok: false,
        error: "Database connection failed",
        message,
        hint: "MongoDB Atlas → Network Access → allow 0.0.0.0/0 (required for Vercel serverless).",
      },
      { status: 503 }
    );
  }
}
