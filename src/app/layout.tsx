import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import PageLoader from "@/components/PageLoader";
import SiteLayoutClient from "@/components/SiteLayoutClient";
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
  metadataBase: new URL("https://iammarkperez.com"),
  title: {
    default: "MARK PEREZ",
    template: "%s — MARK PEREZ",
  },
  description:
    "Portfolio of Mark Perez — content creator, graphic designer, and AI-driven art director based in Dubai.",
  openGraph: {
    siteName: "MARK PEREZ",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og/default.jpg",
        width: 1200,
        height: 630,
        alt: "MARK PEREZ — Content Creator & Graphic Designer, Dubai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/default.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <SiteLayoutClient>{children}</SiteLayoutClient>
        <PageLoader />
        <Analytics />
      </body>
    </html>
  );
}
