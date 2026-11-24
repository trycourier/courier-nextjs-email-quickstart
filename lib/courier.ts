import "server-only";
import Courier from "@trycourier/courier";

let client: Courier | undefined;

// Created on first use so `next build` runs without the key. `server-only` keeps it out of the browser.
export function courier() {
  client ??= new Courier({ apiKey: process.env.COURIER_API_KEY });
  return client;
}
