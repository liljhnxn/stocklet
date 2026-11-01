import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Stocklet | Know what you have. Track what you sell.",
  description:
    "Lightweight, secure Web3 inventory management application for small businesses powered by Botchain Testnet.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-charcoal-950 text-charcoal-100 flex flex-col selection:bg-brand-purple selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

