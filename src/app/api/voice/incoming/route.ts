import { NextResponse } from "next/server";
import twilio from "twilio";
import { prisma } from "@/lib/db";

// Twilio hits this webhook when a scanner dials the Twilio number. We resolve the
// sticker token → owner server-side and bridge the call with TwiML. The owner's
// real number only ever appears inside the TwiML (sent to Twilio), never in a
// response the scanner can read, and never in a log line.
export async function POST(req: Request): Promise<NextResponse> {
  const twiml = new twilio.twiml.VoiceResponse();
  const token = new URL(req.url).searchParams.get("token");

  const qr = token
    ? await prisma.qrToken.findUnique({
        where: { token },
        include: { vehicle: { include: { owner: true } } },
      })
    : null;

  if (!qr || !qr.isActive) {
    twiml.say("This sticker is not active.");
    twiml.hangup();
  } else {
    twiml.say("Connecting you now. Please hold.");
    const dial = twiml.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER,
      timeout: 30,
      action: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/status`,
    });
    dial.number(qr.vehicle.owner.phone);
  }

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
