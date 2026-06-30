import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateQRPng } from "@/lib/qr";

// Creates a QrToken for a vehicle the caller owns and returns a base64 PNG of the
// scanner URL. Protected; verifies vehicle ownership before creating the token.
export async function POST(req: Request): Promise<NextResponse> {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const vehicleId = typeof data.vehicleId === "string" ? data.vehicleId : "";
  if (!vehicleId) {
    return NextResponse.json(
      { error: "vehicleId is required" },
      { status: 400 },
    );
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { ownerId: true },
  });
  if (!vehicle || vehicle.ownerId !== session.ownerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const qrToken = await prisma.qrToken.create({ data: { vehicleId } });
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");
  const origin = base.startsWith("http") ? base : `https://${base}`;
  const url = `${origin}/s/${qrToken.token}`;
  const png = await generateQRPng(url);

  return NextResponse.json({
    tokenId: qrToken.id,
    token: qrToken.token,
    qrBase64: png.toString("base64"),
  });
}
