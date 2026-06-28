import { cookies } from "next/headers";
import { verifyJWT, type SessionPayload } from "./auth";

export function getSession(): SessionPayload | null {
  const cookie = cookies().get("qrcar_session")?.value;
  return cookie ? verifyJWT(cookie) : null;
}
