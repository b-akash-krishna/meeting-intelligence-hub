import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meeting Intelligence Hub — Executive Review Suite",
  description:
    "AI-powered meeting memory. Upload transcripts to extract action items, decisions, sentiment analysis, and get cited answers via RAG chat.",
  keywords: ["meeting intelligence", "AI", "transcript analysis", "action items", "sentiment"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="app-shell min-h-full flex flex-col">{children}</body>
    </html>
  );
}
