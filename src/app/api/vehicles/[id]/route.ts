import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
    select: { ownerId: true },
  });

  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (vehicle.ownerId !== session.ownerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.vehicle.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
