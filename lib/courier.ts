import "server-only";
import Courier from "@trycourier/courier";

let client: Courier | undefined;

// One client for the whole app, created on first use so `next build` runs
// without the key. `server-only` fails the build if a client component
// imports this file, which keeps your API key out of the browser.
export function courier() {
  client ??= new Courier({ apiKey: process.env.COURIER_API_KEY });
  return client;
}
