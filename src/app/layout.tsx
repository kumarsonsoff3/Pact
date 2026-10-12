import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "PACT — Accountable outcomes", template: "%s · PACT" },
  description:
    "Turn commercial intent into reviewed agreements, evidence and accountable outcomes.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
