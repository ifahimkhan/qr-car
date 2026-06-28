import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Middleware runs in the Edge runtime, where `jsonwebtoken` (Node `crypto`)
// fails. `jose` is Edge-safe and verifies the same HS256 token signed by
// `signJWT` in src/lib/auth.ts.
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("qrcar_session")?.value;
  const redirectToRegister = NextResponse.redirect(
    new URL("/register", req.url),
  );

  if (!token) return redirectToRegister;

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return redirectToRegister;
  }
}

export const config = { matcher: ["/dashboard/:path*"] };
