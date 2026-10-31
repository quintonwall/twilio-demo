import twilio from "twilio";

const [to, ...rest] = process.argv.slice(2);
const body = rest.join(" ");

if (!to || !body) {
  console.error('Usage: npm run send -- <phone number in E.164> "<message>"');
  console.error('Example: npm run send -- +15558675310 "Hello from Twilio"');
  process.exit(1);
}

if (!/^\+[1-9]\d{1,14}$/.test(to)) {
  console.error(`"${to}" is not E.164 format (e.g. +15558675310).`);
  process.exit(1);
}

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error("Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN or TWILIO_PHONE_NUMBER. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

try {
  const msg = await client.messages.create({ from: TWILIO_PHONE_NUMBER, to, body });
  console.log(`Sent! SID: ${msg.sid} (status: ${msg.status})`);
} catch (err) {
  console.error(`Failed: ${err.message}${err.code ? ` (Twilio error ${err.code})` : ""}`);
  process.exit(1);
}
