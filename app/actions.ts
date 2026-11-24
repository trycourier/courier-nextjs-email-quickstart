"use server";

import { randomUUID } from "node:crypto";
import { courier } from "@/lib/courier";

export async function signUp(formData: FormData) {
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));

  // randomUUID() stands in for your database user id, so each signup gets its own profile.
  const user = { id: randomUUID(), name, email };

  await courier().send.message({
    message: {
      to: { user_id: user.id, email: user.email },
      routing: { method: "single", channels: ["email"] },
      content: {
        title: "Welcome to Acme, {{name}}",
        body: "Thanks for signing up. Your account is ready.",
      },
      data: { name: user.name },
    },
  });
}
