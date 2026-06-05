import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "LIBRUM — Your brand journey partner",
  description:
    "Generate a complete brand or a complete campaign — voice, visuals, persona, applied mockups, moodboard — reasoned by Gemini, rendered by Nano Banana.",
  metadataBase: new URL("https://librum.app"),
  openGraph: {
    title: "LIBRUM · brander",
    description: "Your brand journey partner.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${GeistSans.variable} ${mono.variable}`}
    >
      <body className="grain">{children}</body>
    </html>
  );
}
