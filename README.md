# Transactional email in Next.js with Courier

A Next.js App Router app where [Courier](https://www.courier.com/docs) sends three transactional emails: a welcome email from a server action when someone signs up, a password reset with a one-time link from a route handler, and a receipt from a Stripe webhook. Courier delivers them through the email provider you connect, Resend in this sample, and adds SMS, push, in-app, fallback, templates, and one log when you need them.

This is the companion project for [Add transactional emails to a Next.js app](https://www.courier.com/docs/guides/add-transactional-email-to-nextjs) in the Courier docs.

## Build it with a coding agent

Paste this into Claude Code, Cursor, or Codex inside your own Next.js app:

```text
Add transactional emails (welcome, password reset, receipts) to this Next.js App Router app with Courier.
Follow https://www.courier.com/docs/guides/add-transactional-email-to-nextjs.md and the reference app at https://github.com/trycourier/courier-nextjs-email-quickstart.
Use @trycourier/courier from a server-only lib/courier.ts and read COURIER_API_KEY from the environment.
Send the welcome email from the signup server action, the password reset from a route handler with one Idempotency-Key per reset, and the receipt from the Stripe webhook with event.id as the key.
Keep Resend as the email provider, connected in Courier.
When done, run npm run send and show me the request id.
```

Install the Courier skill with `npx skills add trycourier/courier-skills`, and connect the [Courier MCP server](https://www.courier.com/docs/resources/mcp) so the agent can read Courier Logs itself.

## Prerequisites

For the first send:

- Node 20.9 or newer
- A [Courier API key](https://app.courier.com/settings/api-keys). A Test key reaches your own workspace address through the built-in Courier Test Email Provider, so you can send before connecting anything.

For the full build:

- A [Resend account](https://resend.com/signup) with a verified sending domain, connected in Courier on the [Resend integration page](https://app.courier.com/integrations/catalog/resend) ([setup guide](https://www.courier.com/docs/integrations/email/resend)), in the same environment (Test or Production) as your API key
- The [Stripe CLI](https://docs.stripe.com/stripe-cli), for the receipt

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
- **Password reset:** `curl -X POST localhost:3000/api/password-reset -H "Content-Type: application/json" -d '{"email":"YOUR_EMAIL"}'`, using the address in `DEMO_EMAIL`. The stand-in user lookup knows only that address.
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

**Replace the stand-in users.** The server action uses `randomUUID()` in place of your database's user id, and the reset route's lookup knows only `DEMO_EMAIL`. Use your own user records.

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
