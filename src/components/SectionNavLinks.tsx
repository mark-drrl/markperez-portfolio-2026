"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { NAV_ACCENT, toneToIdleColor } from "@/lib/sectionNavTone";

const monoText =
  "'JetBrains Mono', 'JetBrainsMono', 'SF Mono', Consolas, monospace";

interface SectionNavLinksProps {
  opacity?: MotionValue<number>;
  /** Scroll-driven 0–1 tone; overrides `variant` when omitted uses variant fallback */
  backgroundTone?: MotionValue<number>;
  variant?: "onLight" | "onDark";
}

interface NavLinkProps {
  href: string;
  label: string;
  toneSource: MotionValue<number>;
}

function NavLink({ href, label, toneSource }: NavLinkProps) {
  const [hovered, setHovered] = useState(false);
  const idleColor = useTransform(toneSource, (tone) => toneToIdleColor(tone));
  const textShadow = useTransform(toneSource, (tone) =>
    tone > 0.45
      ? "0 0 14px rgba(0, 0, 0, 0.28)"
      : "0 0 12px rgba(234, 234, 234, 0.75)",
  );

  return (
    <motion.div
      style={{
        color: hovered ? NAV_ACCENT : idleColor,
        textShadow: hovered ? "none" : textShadow,
      }}
    >
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="transition-opacity duration-300"
      >
        {label}
      </Link>
    </motion.div>
  );
}

export default function SectionNavLinks({
  opacity,
  backgroundTone,
  variant = "onLight",
}: SectionNavLinksProps) {
  const fallbackTone = useMotionValue(variant === "onDark" ? 1 : 0);
  const toneSource = backgroundTone ?? fallbackTone;

  return (
    <motion.nav
      aria-label="Section"
      className="pointer-events-auto absolute right-8 top-8 z-[25] flex items-center gap-4 text-[10px] font-normal uppercase tracking-[0.2em]"
      style={{
        fontFamily: monoText,
        ...(opacity ? { opacity } : {}),
      }}
    >
      <NavLink href="/about" label="ABOUT" toneSource={toneSource} />
      <NavLink href="/contact" label="CONTACT" toneSource={toneSource} />
    </motion.nav>
  );
}
