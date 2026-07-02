import type { Metadata } from "next";
import AboutContactShell from "@/components/AboutContactShell";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Mark Perez — content creator, graphic designer, and AI-driven art director based in Dubai.",
  openGraph: {
    images: [{ url: "/og/default.jpg", width: 1200, height: 630, alt: "MARK PEREZ — Contact" }],
  },
  twitter: {
    images: ["/og/default.jpg"],
  },
};

export default function ContactPage() {
  return <AboutContactShell initialTab="contact" />;
}
