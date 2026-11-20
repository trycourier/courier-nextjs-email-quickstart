# Transactional email in Next.js with Courier

A Next.js App Router app that sends three transactional emails through [Courier](https://www.courier.com/docs): a welcome email from a server action when someone signs up, a password reset with a one-time link from a route handler, and a receipt from a Stripe webhook. Courier delivers them through Resend, which you connect once in the Courier app. Adding SMS, push, or an in-app inbox later is a change to one `routing` line.

This is the companion project for [Add transactional emails to a Next.js app](https://www.courier.com/docs/guides/add-transactional-email-to-nextjs) in the Courier docs.

## Prerequisites

- Node 20.9 or newer
- A [Courier account](https://app.courier.com/signup) and an [API key](https://app.courier.com/settings/api-keys)
- A [Resend account](https://resend.com/signup) with a verified sending domain, connected in Courier on the [Resend integration page](https://app.courier.com/integrations/catalog/resend) ([setup guide](https://www.courier.com/docs/integrations/email/resend))
- The [Stripe CLI](https://docs.stripe.com/stripe-cli), only for the receipt

Connect Resend in the same environment (Test or Production) as your API key. Integrations are per environment.

## Run it

```bash
git clone https://github.com/trycourier/courier-nextjs-email-quickstart.git
cd courier-nextjs-email-quickstart
npm install
cp .env.example .env.local
```

Put your Courier API key in `COURIER_API_KEY` and your own address in `DEMO_EMAIL`, then prove the round trip:

```bash
npm run send
```

The welcome email lands in your inbox, and the message shows up in [Courier Logs](https://app.courier.com/logs) with Resend as the provider.

Then start the app:

```bash
npm run dev
```

- **Welcome email:** open [localhost:3000](http://localhost:3000) and sign up with your address.
- **Password reset:** `curl -X POST localhost:3000/api/password-reset -H "Content-Type: application/json" -d '{"email":"you@example.com"}'`
- **Receipt:** run `stripe listen --forward-to localhost:3000/api/stripe`, copy the `whsec_` secret it prints into `STRIPE_WEBHOOK_SECRET`, restart `npm run dev`, then `stripe trigger invoice.payment_succeeded --override customer:email=you@example.com`.

## How the pieces fit

| File | What it does |
|---|---|
| `lib/courier.ts` | The Courier client. Imports `server-only`, so the API key can't reach a client bundle. |
| `app/actions.ts` | The `signUp` server action. Sends the welcome email. |
| `app/page.tsx` | The signup form that calls the server action. |
| `app/api/password-reset/route.ts` | Creates a reset token and emails the link, with an idempotency key. |
| `app/api/stripe/route.ts` | Verifies Stripe's signature and emails a receipt on `invoice.payment_succeeded`, keyed on the event id. |
| `scripts/send.ts` | Sends the welcome email to `DEMO_EMAIL`, outside Next. |

Every send is one call to `client.send.message` from [`@trycourier/courier`](https://www.npmjs.com/package/@trycourier/courier) with `routing: { method: "single", channels: ["email"] }`. Courier picks the provider connected for the `email` channel, which here is Resend.

## Adapting it to your app

**Replace the demo user.** The server action and the reset route use `user_123` because this sample has no database. Use your own user id and email.

**Store the reset token.** The reset route generates a token and builds the link. Save a hash of the token, the user id, and an expiry in your database, and check them on your reset page.

**Move copy into templates.** The emails use inline content so the sample runs against a fresh workspace with nothing to create first. In production, design the emails in Courier and send `template: "your-template-id"` with `data`, so you can edit copy without a deploy.

## Scripts

| | |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run send` | Send the welcome email to `DEMO_EMAIL` |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |

## Troubleshooting

**`UNROUTABLE` with reason `NO_PROVIDERS` in Logs.** Resend is connected in a different environment from your API key. Connect it in the same one, or use that environment's key.

**The email came from the Courier Test Email Provider.** Every Test environment ships with it. Move Resend above it in the email channel's provider priority.

**Resend rejects the send.** The From address on the Resend integration must be on a domain you verified in Resend.

**`401` from Courier.** The key in `.env.local` is wrong, or the dev server started before you saved it. Restart it.

## License

MIT
