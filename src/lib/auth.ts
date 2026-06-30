import jwt from "jsonwebtoken";
import { createHmac } from "crypto";

export interface SessionPayload {
  ownerId: string;
  phone: string;
}

const OTP_WINDOW_MIN = 5;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return secret;
}

// Returns the current 5-minute time bucket (rolls every 5 min).
function timeBucket(): number {
  return Math.floor(Date.now() / (OTP_WINDOW_MIN * 60 * 1000));
}

// Derives a 6-digit OTP from phone + time bucket + secret.
// Stateless — any serverless instance produces the same code for the same inputs.
function deriveCode(phone: string, bucket: number): string {
  const hmac = createHmac("sha256", getJwtSecret());
  hmac.update(`${phone}:${bucket}`);
  const n = parseInt(hmac.digest("hex").slice(0, 8), 16);
  return ((n % 900000) + 100000).toString();
}

export function generateOTP(phone: string): string {
  return deriveCode(phone, timeBucket());
}

export function verifyOTP(phone: string, code: string): boolean {
  const bucket = timeBucket();
  // Accept current bucket and the previous one (covers window-boundary edge case).
  return deriveCode(phone, bucket) === code || deriveCode(phone, bucket - 1) === code;
}

export function signJWT(payload: SessionPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyJWT(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}
