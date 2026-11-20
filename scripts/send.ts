import { config } from "dotenv";
import Courier from "@trycourier/courier";

// Next reads .env.local automatically. A standalone script does not.
config({ path: ".env.local", quiet: true });
config({ quiet: true });

/**
 * Sends the welcome email from app/actions.ts to DEMO_EMAIL, so you can prove
 * your API key and your Resend integration work before you wire up a form.
 */
async function main() {
  const apiKey = process.env.COURIER_API_KEY;
  const email = process.env.DEMO_EMAIL;

  if (!apiKey || !email) {
    console.error("Set COURIER_API_KEY and DEMO_EMAIL. Copy .env.example to .env.local and fill both in.");
    process.exit(1);
  }

  const client = new Courier({ apiKey });

  const { requestId } = await client.send.message({
    message: {
      to: { user_id: "user_123", email },
      routing: { method: "single", channels: ["email"] },
      content: {
        title: "Welcome to Acme, {{name}}",
        body: "Thanks for signing up. Your account is ready.",
      },
      data: { name: "Sarah Bennett" },
    },
  });

  console.log(`Sent to ${email}. Request id: ${requestId}`);
  console.log("Open https://app.courier.com/logs to follow it to Resend.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
