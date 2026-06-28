import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Enables/disables a QrToken. Protected; verifies the token belongs to a vehicle
// owned by the caller before mutating.
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
  const tokenId = typeof data.tokenId === "string" ? data.tokenId : "";
  if (!tokenId || typeof data.isActive !== "boolean") {
    return NextResponse.json(
      { error: "tokenId and isActive are required" },
      { status: 400 },
    );
  }
  const isActive = data.isActive;

  const token = await prisma.qrToken.findUnique({
    where: { id: tokenId },
    select: { vehicle: { select: { ownerId: true } } },
  });
  if (!token || token.vehicle.ownerId !== session.ownerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.qrToken.update({
    where: { id: tokenId },
    data: { isActive },
  });

  return NextResponse.json({ success: true, isActive: updated.isActive });
}
