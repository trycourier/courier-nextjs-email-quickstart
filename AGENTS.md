# Courier + Next.js transactional email

A Next.js App Router app that sends a welcome email (server action), a password reset (route handler), and a Stripe receipt (webhook route) with Courier. Courier delivers email through the provider connected in the Courier app, Resend in this sample.

Guide: https://www.courier.com/docs/guides/add-transactional-email-to-nextjs

## Commands

- `npm install`
- `npm run send`: send the welcome email to `DEMO_EMAIL` and print the request id
- `npm run dev`: serve the signup form at http://localhost:3000
- `npm run typecheck` and `npm run build`: check before you finish

## Environment (`.env.local`, copied from `.env.example`)

- `COURIER_API_KEY`: read by the Courier SDK in `lib/courier.ts` and `scripts/send.ts`
- `DEMO_EMAIL`: recipient for `npm run send`, and the only address the reset stub knows
- `APP_URL`: base of the password reset link
- `STRIPE_WEBHOOK_SECRET`: verifies Stripe signatures in `app/api/stripe/route.ts`

## Files

- `lib/courier.ts`: the Courier client, created on first use, guarded by `server-only`
- `app/actions.ts`: `signUp` server action, sends the welcome email
- `app/page.tsx`: the signup form
- `app/api/password-reset/route.ts`: reset token and email, with an idempotency key
- `app/api/stripe/route.ts`: verifies the event and emails a receipt on `invoice.payment_succeeded`
- `scripts/send.ts`: the welcome email outside Next.js

## Rules

- Keep `import "server-only"` in `lib/courier.ts`. Never import it from a client component.
- Create the client lazily. `next build` imports routes without env vars set.
- Pass one `Idempotency-Key` per event: the reset id, or the Stripe `event.id`.
- Build reset links from `APP_URL`, never from the request's Host header.
- Read the Stripe body with `request.text()` before `constructEvent`.
- Replace the stand-in user ids and lookup with your database. Never send every user as one id.
