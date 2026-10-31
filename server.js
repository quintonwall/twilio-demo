import express from "express";
import twilio from "twilio";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, PORT = 3000 } = process.env;
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error("Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN or TWILIO_PHONE_NUMBER in .env");
  process.exit(1);
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/send", async (req, res) => {
  const { to, body } = req.body ?? {};
  if (!/^\+[1-9]\d{1,14}$/.test(to ?? "")) {
    return res.status(400).json({ error: "Phone number must be in E.164 format, e.g. +15558675310" });
  }
  if (!body?.trim()) {
    return res.status(400).json({ error: "Message can't be empty" });
  }
  try {
    const msg = await client.messages.create({ from: TWILIO_PHONE_NUMBER, to, body });
    res.json({ sid: msg.sid, status: msg.status });
  } catch (err) {
    res.status(502).json({ error: err.message, code: err.code });
  }
});

// Bound to localhost so only this machine can send texts with your account.
app.listen(PORT, "127.0.0.1", () => console.log(`Open http://localhost:${PORT}`));
