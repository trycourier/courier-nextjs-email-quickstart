import "server-only";
import Courier from "@trycourier/courier";

let client: Courier | undefined;

// Created on first use so `next build` runs without the key. `server-only` keeps it out of the browser.
// maxRetries 0: these sends run while a user or Stripe waits, so fail fast and retry from a queue.
export function courier() {
  client ??= new Courier({ apiKey: process.env.COURIER_API_KEY, maxRetries: 0 });
  return client;
}
