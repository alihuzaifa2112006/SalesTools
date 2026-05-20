import jwt, { type SignOptions } from "jsonwebtoken";
import { getJwtSecrets } from "@/lib/env";
import type { JWTPayload } from "@/types";

const accessOptions: SignOptions = { expiresIn: "15m" };
const refreshOptions: SignOptions = { expiresIn: "7d" };

export function signAccessToken(payload: JWTPayload): string {
  const { access } = getJwtSecrets();
  return jwt.sign(payload, access, accessOptions);
}

export function signRefreshToken(payload: JWTPayload): string {
  const { refresh } = getJwtSecrets();
  return jwt.sign(payload, refresh, refreshOptions);
}

export function verifyAccessToken(token: string): JWTPayload {
  const { access } = getJwtSecrets();
  return jwt.verify(token, access) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  const { refresh } = getJwtSecrets();
  return jwt.verify(token, refresh) as JWTPayload;
}
