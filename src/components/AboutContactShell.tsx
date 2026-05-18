"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LuxuryCursor from "@/components/LuxuryCursor";

type InfoTab = "about" | "contact";

const skillGroups = [
  [
    "GRAPHIC DESIGNER",
    "AI PRACTITIONER",
    "WEB DESIGNER AND BUILDER",
    "PHOTOGRAPHER/VIDEOGRAPHER",
    "SOCIAL MEDIA MANAGER",
  ],
  [
    "DAVINCI RESOLVE",
    "ADOBE PHOTOSHOP",
    "ADOBE LIGHTROOM",
    "FIGMA",
    "HIGGSFIELD",
    "AI WORKFLOWS",
    "AI IMAGE GENERATION",
    "AI VIDEO GENERATION",
    "CLAUDE.AI",
    "CURSOR",
    "BASIC IT SUPPORT",
  ],
] as const;

interface AboutContactShellProps {
  initialTab: InfoTab;
}

export default function AboutContactShell({ initialTab }: AboutContactShellProps) {
  const [activeTab, setActiveTab] = useState<InfoTab>(initialTab);
  const [isBlurring, setIsBlurring] = useState(false);
  const switchTimeoutRef = useRef(0);
  const blurTimeoutRef = useRef(0);

  useEffect(() => {
    function handlePopState() {
      setActiveTab(window.location.pathname === "/contact" ? "contact" : "about");
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.clearTimeout(switchTimeoutRef.current);
      window.clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  function switchTab(nextTab: InfoTab) {
    if (nextTab === activeTab) {
      return;
    }

    setIsBlurring(true);
    window.clearTimeout(switchTimeoutRef.current);
    window.clearTimeout(blurTimeoutRef.current);
    switchTimeoutRef.current = window.setTimeout(() => {
      setActiveTab(nextTab);
      window.history.pushState(null, "", nextTab === "about" ? "/about" : "/contact");
    }, 220);
    blurTimeoutRef.current = window.setTimeout(() => setIsBlurring(false), 680);
  }

  return (
    <main className="relative h-screen overflow-hidden bg-[#E5E5E3] text-[#151515]">
      <nav className="font-neue absolute left-1/2 top-8 z-20 -translate-x-1/2 text-[9px] uppercase tracking-[0.34em] text-black/38">
        <Link className="transition-colors hover:text-[#9F1F2E]" href="/">
          HOME
        </Link>{" "}
        <button
          type="button"
          onClick={() => switchTab("about")}
          className={`transition-colors hover:text-[#9F1F2E] ${
            activeTab === "about" ? "text-[#9F1F2E]" : ""
          }`}
        >
          ABOUT
        </button>{" "}
        <button
          type="button"
          onClick={() => switchTab("contact")}
          className={`transition-colors hover:text-[#9F1F2E] ${
            activeTab === "contact" ? "text-[#9F1F2E]" : ""
          }`}
        >
          CONTACT
        </button>
      </nav>

      <AnimatePresence mode="wait">
        {activeTab === "about" ? (
          <motion.section
            key="about"
            className="grid h-full grid-cols-[1fr_minmax(260px,26vw)_1fr] items-center gap-[6vw] px-[12vw]"
            initial={{ opacity: 0, filter: "blur(18px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(18px)" }}
            transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex justify-end text-right">
              <div>
                <h1 className="font-editorial text-[clamp(25px,2.1vw,38px)] uppercase leading-[0.86] tracking-[0.1em]">
                  MARK
                  <br />
                  PEREZ
                </h1>
                <p className="font-neue mt-5 text-[9px] uppercase leading-[1.35] tracking-[0.22em] text-black/46">
                  FULL STACK
                  <br />
                  CREATIVE SPECIALIST
                  <br />
                  AND A PRETTY CHILL
                  <br />
                  DUDE
                </p>
              </div>
            </div>

            <div className="relative mx-auto aspect-[618/824] w-full max-w-[335px] overflow-hidden bg-neutral-300">
              <img
                src="/about.jpg"
                alt="Mark Perez"
                className="h-full w-full object-cover grayscale contrast-110 brightness-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 bg-[#E5E5E3]/12 mix-blend-screen" />
            </div>

            <div className="grid max-w-[360px] grid-cols-[1px_1fr] gap-12">
              <div className="h-[225px] w-px self-center bg-[#9F1F2E]" />
              <div className="self-center text-[8.8px] uppercase leading-[1.45] tracking-[0.26em] text-black/42 [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]">
                {skillGroups.map((group, groupIndex) => (
                  <p key={groupIndex} className={groupIndex > 0 ? "mt-8" : undefined}>
                    {group.map((item) => (
                      <span key={item}>
                        {item}
                        <br />
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>

            <p className="font-neue absolute bottom-[8vh] left-1/2 max-w-[190px] -translate-x-1/2 text-center text-[9px] leading-[1.25] tracking-[0.16em] text-black/44">
              I like the outdoors so I used this random photo lol
            </p>
          </motion.section>
        ) : (
          <motion.section
            key="contact"
            className="flex h-full items-center justify-center text-center"
            initial={{ opacity: 0, filter: "blur(18px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(18px)" }}
            transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
          >
            <div>
              <h1 className="font-editorial text-[clamp(24px,2.4vw,42px)] uppercase leading-[0.9] tracking-[0.035em]">
                MARK PEREZ
              </h1>
              <div className="font-neue mt-8 space-y-2 text-[13px] leading-relaxed tracking-[0.14em] text-black/48">
                <p>markdarrelperezmdp@gmail.com</p>
                <p>+971 58 257 7153</p>
                <p>+63 966 455 8195</p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBlurring && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-10 bg-[#E5E5E3]/22 backdrop-blur-[26px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <Link
        href="/#works"
        className="font-neue absolute bottom-5 left-5 z-30 text-[10px] font-medium uppercase tracking-[0.28em] text-black/36 transition-colors hover:text-[#9F1F2E]"
      >
        BACK TO WORKS
      </Link>

      <div className="absolute bottom-5 right-5 z-30 text-right text-[9px] uppercase leading-[1.45] tracking-[0.22em] text-black/38 [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]">
        <p className="font-neue text-[10px] tracking-[0.18em] text-black/50">
          Website made with
        </p>
        <p className="mt-1">
          FIGMA
          <br />
          CURSOR
          <br />
          CLAUDE
        </p>
      </div>

      <LuxuryCursor />
    </main>
  );
}
