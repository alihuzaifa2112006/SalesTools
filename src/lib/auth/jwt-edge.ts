import { jwtVerify } from "jose";
import type { JWTPayload } from "@/types";

function getAccessKey(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
}

export async function verifyAccessTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessKey());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      workspaceId: payload.workspaceId as string | undefined,
    };
  } catch {
    return null;
  }
}
