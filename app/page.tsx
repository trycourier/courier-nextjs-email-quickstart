import { signUp } from "./actions";

export default function Home() {
  return (
    <main>
      <h1>Create your account</h1>
      <form action={signUp} style={{ display: "grid", gap: "0.75rem" }}>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <button type="submit">Sign up</button>
      </form>
    </main>
  );
}
