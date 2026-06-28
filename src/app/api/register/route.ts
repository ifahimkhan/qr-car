import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Completes the owner profile (name) and creates their first vehicle. Protected:
// requires a valid session cookie.
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
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const regNumber =
    typeof data.regNumber === "string" ? data.regNumber.trim() : "";
  const make = typeof data.make === "string" ? data.make : "";
  const model = typeof data.model === "string" ? data.model : "";
  const color = typeof data.color === "string" ? data.color : "";

  if (!name || !regNumber) {
    return NextResponse.json(
      { error: "name and regNumber are required" },
      { status: 400 },
    );
  }

  await prisma.owner.update({
    where: { id: session.ownerId },
    data: { name },
  });

  const vehicle = await prisma.vehicle.create({
    data: { ownerId: session.ownerId, regNumber, make, model, color },
  });

  return NextResponse.json({ success: true, vehicleId: vehicle.id });
}
