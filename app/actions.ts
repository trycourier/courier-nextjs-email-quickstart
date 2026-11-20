"use server";

import { courier } from "@/lib/courier";

export async function signUp(formData: FormData) {
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));

  // Create the user in your database here. This sample has no database,
  // so every signup uses the demo id.
  const user = { id: "user_123", name, email };

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
