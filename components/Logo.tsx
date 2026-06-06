import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Highrise — headlines / display
const display = localFont({
  src: [
    { path: "../public/fonts/Highrise-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Highrise-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

// Adelle Sans — body / subheading / UI / special
// Multiple weight ranges so font-medium (500), font-semibold (600), font-bold (700)
// all resolve to real files instead of synthesizing.
const sans = localFont({
  src: [
    { path: "../public/fonts/AdelleSans-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/AdelleSans-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "../public/fonts/AdelleSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/AdelleSans-RegularItalic.woff2", weight: "400", style: "italic" },
    { path: "../public/fonts/AdelleSans-Semibold.woff2", weight: "500 600", style: "normal" },
    { path: "../public/fonts/AdelleSans-SemiboldItalic.woff2", weight: "500 600", style: "italic" },
    { path: "../public/fonts/AdelleSans-Bold.woff2", weight: "700 800", style: "normal" },
    { path: "../public/fonts/AdelleSans-BoldItalic.woff2", weight: "700 800", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
});

// Mono slot — also Adelle Sans (semibold). Existing `font-mono` Tailwind classes
// still work; they now render in Adelle Sans tracked-out caps instead of JetBrains Mono.
const mono = localFont({
  src: [
    { path: "../public/fonts/AdelleSans-Semibold.woff2", weight: "500 700", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
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
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="grain">{children}</body>
    </html>
  );
}
