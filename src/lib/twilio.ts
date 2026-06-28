import twilio from "twilio";

// Singleton Twilio REST client. Constructed eagerly — the constructor does not
// throw on missing credentials (it only fails on an actual API call), so this is
// safe to import in local dev where the console.log OTP fallback is used instead.
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export default client;
