import jwt from "jsonwebtoken";

export interface SessionPayload {
  ownerId: string;
  phone: string;
}

interface OtpEntry {
  code: string;
  expiresAt: number;
}

const OTP_TTL_MS = 5 * 60 * 1000;

// Pin OTP store to globalThis so it survives Next dev HMR and is shared across
// separately-bundled route handlers (same reason db.ts pins the Prisma client).
const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpEntry>;
};
const otpStore = globalForOtp.otpStore ?? new Map<string, OtpEntry>();
if (process.env.NODE_ENV !== "production") globalForOtp.otpStore = otpStore;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return secret;
}

export function generateOTP(phone: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });
  return code;
}

export function verifyOTP(phone: string, code: string): boolean {
  const entry = otpStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return false;
  }
  if (entry.code !== code) return false;
  otpStore.delete(phone);
  return true;
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
