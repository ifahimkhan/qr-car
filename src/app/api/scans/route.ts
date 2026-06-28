import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Returns the authenticated owner's scan history (newest 50). Ownership is
// enforced in the query filter; only vehicle display fields are selected, never
// the owner's phone.
export async function GET(req: Request): Promise<NextResponse> {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vehicleId = new URL(req.url).searchParams.get("vehicleId");

  const events = await prisma.scanEvent.findMany({
    where: {
      token: {
        vehicle: {
          ownerId: session.ownerId,
          ...(vehicleId ? { id: vehicleId } : {}),
        },
      },
    },
    orderBy: { scannedAt: "desc" },
    take: 50,
    select: {
      id: true,
      actionType: true,
      lat: true,
      lng: true,
      scannedAt: true,
      token: {
        select: {
          vehicle: { select: { regNumber: true, make: true, model: true } },
        },
      },
    },
  });

  const result = events.map((e) => ({
    id: e.id,
    actionType: e.actionType,
    lat: e.lat,
    lng: e.lng,
    scannedAt: e.scannedAt.toISOString(),
    vehicle: e.token.vehicle,
  }));

  return NextResponse.json(result);
}
