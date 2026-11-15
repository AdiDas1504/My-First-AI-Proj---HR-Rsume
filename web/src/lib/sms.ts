import "server-only";
import { config } from "./config";

/**
 * Sends the login code. "console" logs the code (development / demo);
 * "twilio" sends a real SMS. To use an Israeli SMS gateway instead, add a
 * branch here with the same signature.
 */
export async function sendLoginCode(phone: string, code: string): Promise<void> {
  const body = `קוד הכניסה שלך ל-JobFit: ${code}\nתוקף: 5 דקות. אם לא ביקשת קוד, אפשר להתעלם.`;

  if (config.smsProvider === "twilio") {
    const { accountSid, authToken, from } = config.twilio;
    if (!accountSid || !authToken || !from) throw new Error("Twilio is not configured");
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: phone, From: from, Body: body }),
    });
    if (!res.ok) throw new Error(`SMS send failed (${res.status})`);
    return;
  }

  console.info(`[sms:console] ${phone} -> ${code}`);
}
