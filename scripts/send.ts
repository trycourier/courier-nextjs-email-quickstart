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

  if (!apiKey) {
    console.error("COURIER_API_KEY is not set. Add it to .env.local.");
    process.exit(1);
  }

  if (!email || email === "YOUR_EMAIL") {
    console.error("DEMO_EMAIL is not set. Put your own email address in .env.local.");
    process.exit(1);
  }

  const client = new Courier({ apiKey });

  const { requestId } = await client.send.message({
    message: {
      // A demo user. Your app sends to the signed-up user from its database.
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
