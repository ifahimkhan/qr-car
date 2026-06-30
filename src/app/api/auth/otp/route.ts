import { NextResponse } from "next/server";
import { generateOTP } from "@/lib/auth";
import { sendSMS } from "@/lib/notify";

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

  if (typeof phone !== "string" || phone.trim() === "") {
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  }

  const code = generateOTP(phone);

  const twilioReady =
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;

  if (twilioReady) {
    try {
      await sendSMS(phone, `Your QR Car code: ${code}. Valid for 5 minutes.`);
    } catch (err) {
      // SMS failed (e.g. international restriction, trial account limit).
      // Log OTP to console so dev/staging can still test the full flow.
      console.error("[OTP] SMS send failed — falling back to console:", err);
      console.log(`[OTP] ${phone} → ${code}`);
    }
  } else {
    console.log(`[OTP] ${phone} → ${code}`);
  }

  return NextResponse.json({ success: true });
}
