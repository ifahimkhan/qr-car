import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyOTP, signJWT } from "@/lib/auth";

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const phone =
    typeof body === "object" && body !== null && "phone" in body
      ? (body as { phone: unknown }).phone
      : undefined;
  const code =
    typeof body === "object" && body !== null && "code" in body
      ? (body as { code: unknown }).code
      : undefined;

  if (typeof phone !== "string" || typeof code !== "string") {
    return NextResponse.json(
      { error: "Phone and code are required" },
      { status: 400 },
    );
  }

  if (!verifyOTP(phone, code)) {
    return NextResponse.json(
      { error: "Invalid or expired code" },
      { status: 401 },
    );
  }

  const owner = await prisma.owner.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });

  const token = signJWT({ ownerId: owner.id, phone: owner.phone });

  const res = NextResponse.json({
    success: true,
    isNewUser: owner.name === "",
  });
  res.cookies.set("qrcar_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
