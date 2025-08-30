import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mug Tournament",
  description: "Vote for your favorite mugs in the ultimate cabinet-worthy tournament! Help decide which mugs deserve a spot on display.",
  openGraph: {
    title: "Mug Tournament",
    description: "Vote for your favorite mugs in the ultimate cabinet-worthy tournament!",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mug Tournament",
    description: "Vote for your favorite mugs in the ultimate cabinet-worthy tournament!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
