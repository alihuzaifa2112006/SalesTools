const REQUIRED_ENV = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
] as const;

export function getMissingEnvVars(): string[] {
  return REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
}

export function assertEnvConfigured(): void {
  const missing = getMissingEnvVars();
  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}. Add them in Vercel → Settings → Environment Variables.`
    );
  }
}

export function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }
  return uri;
}

export function getJwtSecrets(): { access: string; refresh: string } {
  const access = process.env.JWT_ACCESS_SECRET?.trim();
  const refresh = process.env.JWT_REFRESH_SECRET?.trim();
  if (!access || !refresh) {
    throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be configured");
  }
  return { access, refresh };
}
