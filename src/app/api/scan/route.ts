import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyOwner, notifyEmergencyContacts } from "@/lib/notify";

const VALID_ACTIONS = ["call", "whatsapp", "sos"] as const;
type ActionType = (typeof VALID_ACTIONS)[number];

function isActionType(value: unknown): value is ActionType {
  return (
    typeof value === "string" &&
    (VALID_ACTIONS as readonly string[]).includes(value)
  );
}

// PUBLIC — no session. A scanner POSTs the sticker token + chosen action. We log
// the event and fan out notifications. The owner's phone/name is never returned.
export async function POST(req: Request): Promise<NextResponse> {
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
  const token = typeof data.token === "string" ? data.token : "";
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }
  if (!isActionType(data.actionType)) {
    return NextResponse.json(
      { error: "actionType must be call, whatsapp, or sos" },
      { status: 400 },
    );
  }
  const actionType = data.actionType;
  const lat = typeof data.lat === "number" ? data.lat : undefined;
  const lng = typeof data.lng === "number" ? data.lng : undefined;

  const qr = await prisma.qrToken.findUnique({
    where: { token },
    include: {
      vehicle: {
        include: { owner: { include: { emergencyContacts: true } } },
      },
    },
  });
  if (!qr || !qr.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.scanEvent.create({
    data: { tokenId: qr.id, actionType, lat, lng },
  });

  const { vehicle } = qr;
  await notifyOwner(
    vehicle.owner.phone,
    vehicle.regNumber,
    actionType,
    lat,
    lng,
  );

  if (actionType === "sos" && vehicle.owner.emergencyContacts.length > 0) {
    await notifyEmergencyContacts(
      vehicle.owner.emergencyContacts.map((c: { phone: string; name: string }) => ({
        phone: c.phone,
        name: c.name,
      })),
      vehicle.regNumber,
      lat,
      lng,
    );
  }

  return NextResponse.json({ success: true });
}
