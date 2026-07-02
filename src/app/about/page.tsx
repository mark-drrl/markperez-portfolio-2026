import type { Metadata } from "next";
import AboutContactShell from "@/components/AboutContactShell";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mark Perez is a content creator, graphic designer, and AI-driven art director based in Dubai — working across cinematography, social strategy, and visual production.",
  openGraph: {
    images: [{ url: "/og/default.jpg", width: 1200, height: 630, alt: "MARK PEREZ — About" }],
  },
  twitter: {
    images: ["/og/default.jpg"],
  },
};

export default function AboutPage() {
  return <AboutContactShell initialTab="about" />;
}
