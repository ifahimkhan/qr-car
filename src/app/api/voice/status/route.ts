import { NextResponse } from "next/server";
import twilio from "twilio";

// Twilio calls this when the bridged leg ends (the `action` URL on the Dial verb).
// If the owner did not pick up, inform the caller; always hang up.
export async function POST(req: Request): Promise<NextResponse> {
  const form = await req.formData();
  const status = form.get("DialCallStatus");

  const twiml = new twilio.twiml.VoiceResponse();
  if (status !== "completed") {
    twiml.say(
      "The owner could not be reached. They have been notified by message.",
    );
  }
  twiml.hangup();

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
