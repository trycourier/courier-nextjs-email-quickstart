import { randomBytes, randomUUID } from "node:crypto";
import { courier } from "@/lib/courier";

export async function POST(request: Request) {
  const { email } = await request.json();
  const user = await findUserByEmail(email);

  // Answer the same way whether or not the account exists, so this route
  // can't be used to find out who has one.
  if (!user) return Response.json({ ok: true });

  const resetId = randomUUID();
  const token = randomBytes(32).toString("base64url");
  // Save resetId, user.id, a hash of the token, and an expiry in your database.

  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

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
    // One key per reset. If the SDK retries this call, Courier returns the
    // first response instead of sending a second email.
    "Idempotency-Key": `password-reset-${resetId}`,
  });

  return Response.json({ ok: true });
}

// Stand-in for your user lookup. Replace it with a query against your database.
// It only knows the demo user, so this route can't email arbitrary addresses.
async function findUserByEmail(email: string) {
  return email === process.env.DEMO_EMAIL ? { id: "user_123", email } : null;
}
