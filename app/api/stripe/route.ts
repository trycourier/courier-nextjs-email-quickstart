import Stripe from "stripe";
import { courier } from "@/lib/courier";

// Stripe amounts are in each currency's smallest unit: https://docs.stripe.com/currencies
const ZERO_DECIMAL = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "vnd", "vuv", "xaf", "xof", "xpf"]);
const THREE_DECIMAL = new Set(["bhd", "jod", "kwd", "omr", "tnd"]);

export async function POST(request: Request) {
  // Stripe signs the raw body, so read it as text, not JSON.
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    // Verifying a signature needs only the signing secret, not a Stripe API key.
    event = Stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "invoice.payment_succeeded") {
    return new Response("Ignored", { status: 200 });
  }

  const invoice = event.data.object;
  if (!invoice.customer_email) return new Response("No email", { status: 200 });

  const decimals = ZERO_DECIMAL.has(invoice.currency) ? 0 : THREE_DECIMAL.has(invoice.currency) ? 3 : 2;
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: invoice.currency,
  }).format(invoice.amount_paid / 10 ** decimals);

  await courier().send.message({
    message: {
      to: { email: invoice.customer_email },
      routing: { method: "single", channels: ["email"] },
      content: {
        title: `Your Acme receipt for ${amount}`,
        body: `We received your payment of ${amount} for invoice ${invoice.number}. Thanks for being a customer.`,
      },
    },
    // Stripe can redeliver an event, so its id as the key blocks a second receipt.
    "Idempotency-Key": event.id,
  });

  return new Response("OK", { status: 200 });
}
