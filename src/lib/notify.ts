import client from "./twilio";

const SMS_FROM = process.env.TWILIO_PHONE_NUMBER;
const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

interface EmergencyContact {
  phone: string;
  name: string;
}

function mapsLink(lat?: number, lng?: number): string {
  return lat !== undefined && lng !== undefined
    ? ` Location: https://maps.google.com/?q=${lat},${lng}`
    : "";
}

function logFailures(
  results: PromiseSettledResult<unknown>[],
  context: string,
): void {
  for (const result of results) {
    if (result.status === "rejected") {
      console.error(`[notify:${context}] send failed:`, result.reason);
    }
  }
}

/** Send a plain SMS via the Twilio number. Throws on failure. */
export async function sendSMS(to: string, body: string): Promise<void> {
  await client.messages.create({ from: SMS_FROM, to, body });
}

/** Send a WhatsApp message. Prepends the `whatsapp:` channel prefix to `to`. */
export async function sendWhatsApp(to: string, body: string): Promise<void> {
  await client.messages.create({
    from: `whatsapp:${WHATSAPP_FROM}`,
    to: `whatsapp:${to}`,
    body,
  });
}

/**
 * Alert an owner that someone scanned their sticker. Sends SMS + WhatsApp in
 * parallel and never throws — individual failures are logged, not re-thrown.
 */
export async function notifyOwner(
  ownerPhone: string,
  vehicleReg: string,
  actionType: string,
  lat?: number,
  lng?: number,
): Promise<void> {
  const location = mapsLink(lat, lng);
  const body =
    actionType === "sos"
      ? `SOS alert for your vehicle ${vehicleReg}. Someone scanned your sticker and needs urgent help.${location}`
      : `Someone is trying to reach you about your vehicle ${vehicleReg}.${location}`;

  const results = await Promise.allSettled([
    sendSMS(ownerPhone, body),
    sendWhatsApp(ownerPhone, body),
  ]);
  logFailures(results, "notifyOwner");
}

/**
 * Fan out an SOS alert to every emergency contact over SMS + WhatsApp. Never
 * throws — individual failures are logged.
 */
export async function notifyEmergencyContacts(
  contacts: EmergencyContact[],
  vehicleReg: string,
  lat?: number,
  lng?: number,
): Promise<void> {
  const location = mapsLink(lat, lng);
  const body = `SOS: vehicle ${vehicleReg} owner triggered an emergency alert.${location}`;

  const results = await Promise.allSettled(
    contacts.flatMap((contact) => [
      sendSMS(contact.phone, body),
      sendWhatsApp(contact.phone, body),
    ]),
  );
  logFailures(results, "notifyEmergencyContacts");
}
