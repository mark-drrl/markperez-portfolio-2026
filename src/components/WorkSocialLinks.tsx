"use client";

import type { WorkPageSocialLink } from "@/constants/workPageSocialLinks";
import { NAV_ACCENT, toneToIdleColor } from "@/lib/sectionNavTone";
import {
  motion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useState } from "react";

const monoFont =
  "[font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]";

interface WorkSocialLinkItemProps {
  item: WorkPageSocialLink;
  toneSource: MotionValue<number>;
}

function WorkSocialLinkItem({ item, toneSource }: WorkSocialLinkItemProps) {
  const [hovered, setHovered] = useState(false);
  const idleColor = useTransform(toneSource, (tone) => toneToIdleColor(tone));
  const textShadow = useTransform(toneSource, (tone) =>
    tone > 0.45
      ? "0 0 14px rgba(0, 0, 0, 0.32)"
      : "0 0 12px rgba(234, 234, 234, 0.8)",
  );

  const sharedProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    className: `pointer-events-auto block tracking-[0.2em] transition-opacity duration-300 ${monoFont}`,
  };

  if (item.href) {
    const isExternal = item.href.startsWith("http");

    return (
      <motion.div
        style={{
          color: hovered ? NAV_ACCENT : idleColor,
          textShadow: hovered ? "none" : textShadow,
        }}
      >
        <a
          {...sharedProps}
          href={item.href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          {item.label}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{
        color: hovered ? NAV_ACCENT : idleColor,
        textShadow: hovered ? "none" : textShadow,
      }}
    >
      <button {...sharedProps} type="button">
        {item.label}
      </button>
    </motion.div>
  );
}

interface WorkSocialLinksProps {
  links: readonly WorkPageSocialLink[];
  toneSource: MotionValue<number>;
  className?: string;
}

export default function WorkSocialLinks({
  links,
  toneSource,
  className = "",
}: WorkSocialLinksProps) {
  return (
    <div
      className={`mt-1 flex flex-col items-start gap-0.5 ${className}`}
    >
      {links.map((item) => (
        <WorkSocialLinkItem
          key={item.label}
          item={item}
          toneSource={toneSource}
        />
      ))}
    </div>
  );
}
