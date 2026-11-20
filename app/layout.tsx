import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courier email: Next.js quickstart",
  description: "Transactional email in a Next.js App Router app, sent with Courier.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: "28rem", margin: "4rem auto", padding: "0 1rem" }}>
        {children}
      </body>
    </html>
  );
}
