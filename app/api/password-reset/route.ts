import { randomBytes, randomUUID } from "node:crypto";
import { courier } from "@/lib/courier";

export async function POST(request: Request) {
  // Build reset links from APP_URL, never from the request's Host header.
  const appUrl = process.env.APP_URL;
  if (!appUrl) throw new Error("APP_URL is not set. Reset links need your app's public URL.");

  const { email } = await request.json();
  const user = await findUserByEmail(email);

  // Same answer either way, so this route can't reveal who has an account.
  if (!user) return Response.json({ ok: true });

  const resetId = randomUUID();
  const token = randomBytes(32).toString("base64url");
  // Save resetId, user.id, a hash of the token, and an expiry in your database.

  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  await courier().send.message({
    message: {
      to: { user_id: user.id, email: user.email },
      routing: { method: "single", channels: ["email"] },
      content: {
        version: "2022-01-01",
        elements: [
          { type: "meta", title: "Reset your Acme password" },
          { type: "text", content: "Use the button below to choose a new password. The link expires in one hour." },
          { type: "action", content: "Reset password", href: resetUrl },
          { type: "text", content: "If you didn't ask for this, ignore this email." },
        ],
      },
    },
    // One key per reset, so a retry returns the first response instead of a second email.
    "Idempotency-Key": `password-reset-${resetId}`,
  });

  return Response.json({ ok: true });
}

// Stand-in for your user query. It only knows the demo user, so it can't email arbitrary addresses.
async function findUserByEmail(email: string) {
  return email === process.env.DEMO_EMAIL ? { id: "user_123", email } : null;
}
