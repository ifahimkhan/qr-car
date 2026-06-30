import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: session.ownerId },
    select: { id: true, regNumber: true, make: true, model: true, color: true },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(vehicles);
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const regNumber = typeof data.regNumber === "string" ? data.regNumber.trim() : "";
  const make = typeof data.make === "string" ? data.make.trim() : "";
  const model = typeof data.model === "string" ? data.model.trim() : "";
  const color = typeof data.color === "string" ? data.color.trim() : "";

  if (!regNumber) {
    return NextResponse.json({ error: "regNumber is required" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.create({
    data: { ownerId: session.ownerId, regNumber, make, model, color },
  });

  return NextResponse.json({
    id: vehicle.id,
    regNumber: vehicle.regNumber,
    make: vehicle.make,
    model: vehicle.model,
    color: vehicle.color,
  });
}
