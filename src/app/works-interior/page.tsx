import WorksSorenGallery from "@/components/WorksSorenGallery";
import LuxuryCursor from "@/components/LuxuryCursor";
import Link from "next/link";

const galleryItems = [
  { type: "image", src: "/interior/int-1.png", className: "mt-[8vh] w-full aspect-[2160/1350]" },
  { type: "image", src: "/interior/int-2.jpg", className: "w-full aspect-[4809/2803]" },
  { type: "image", src: "/interior/int-3.jpg", className: "w-[96%] aspect-[4992/3328]" },
  { type: "image", src: "/interior/int-4.jpeg", className: "w-[98%] aspect-[4992/3328]" },
  { type: "image", src: "/interior/int-5.jpeg", className: "w-[96%] aspect-[4992/3328]" },
  { type: "image", src: "/interior/int-6.png", className: "mb-[32vh] w-full aspect-[1920/1200]" },
] as const;

const socialButtons: readonly { label: string; href?: string }[] = [
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
  { label: "INSTAGRAM", href: "https://www.instagram.com/mxrkdrrl/" },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/markdarrelperez/" },
  { label: "BEHANCE", href: "https://www.behance.net/markdarrel" },
];

export default function WorksInteriorPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#E5E5E3] text-[#151515]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-[#E5E5E3] via-[#E5E5E3]/82 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-[#E5E5E3] via-[#E5E5E3]/78 to-transparent" />

      <section className="relative z-10 grid h-full grid-cols-1 items-center px-[10vw] md:grid-cols-[1fr_minmax(300px,33vw)_1fr] md:gap-[7vw] md:px-[8vw]">
        <div className="absolute bottom-12 left-5 z-30 flex justify-start md:static md:flex md:justify-end">
          <h1 className="font-editorial max-w-[220px] text-left text-[clamp(25px,2.1vw,38px)] md:text-right leading-[0.86] tracking-[0.04em]">
            INTERIOR
          </h1>
        </div>

        <div className="relative mx-auto h-screen w-full max-w-[82vw] overflow-hidden md:max-w-[420px]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[22vh] bg-gradient-to-b from-[#E5E5E3] via-[#E5E5E3]/72 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[22vh] bg-gradient-to-t from-[#E5E5E3] via-[#E5E5E3]/72 to-transparent" />

          <WorksSorenGallery items={galleryItems} />
        </div>

        <div className="hidden max-w-[360px] grid-cols-[1px_1fr] gap-14 md:grid">
          <div className="h-[225px] w-px self-center bg-[#9F1F2E]" />
          <div className="font-neue self-center text-[11px] leading-[1.25] text-black/58">
            <p className="max-w-[300px]">
              I do professional interior photography seamlessly integrating
              advanced AI generative tools into my creative workflow, crafting
              highly stylized spatial narratives that range from striking
              cinematic brutalism to vibrant, curated maximalist aesthetics.
            </p>

            <p className="mt-9 whitespace-pre-line text-[9px] uppercase leading-[1.45] tracking-[0.22em] text-black/38 [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]">
              SONY A7IV <span className="text-[#9F1F2E]">{"//"}</span> SIGMA
              {"\n"}PHOTOGRAPHY
              {"\n"}AI UTILIZATION
              {"\n"}ADOBE PHOTOSHOP
              {"\n"}ADOBE LIGHTROOM
            </p>
          </div>
        </div>
      </section>

      <Link
        href="/#works"
        className="font-neue absolute bottom-5 left-5 z-30 text-[10px] font-medium uppercase tracking-[0.28em] text-black/36 transition-colors hover:text-[#9F1F2E]"
      >
        BACK TO WORKS
      </Link>
      <div className="absolute bottom-5 right-5 z-30 text-right text-[10px] font-semibold uppercase leading-relaxed tracking-[0.2em] text-black/62">
        <p className="font-neue">
          MARK <span className="text-[#9F1F2E]">PEREZ</span>
        </p>
        <div className="mt-1 flex flex-col items-end gap-0.5 text-black/36 [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]">
          {socialButtons.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="tracking-[0.2em] transition-colors hover:text-[#9F1F2E]"
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.label}
                type="button"
                className="tracking-[0.2em] transition-colors hover:text-[#9F1F2E]"
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      </div>

      <LuxuryCursor />
    </main>
  );
}
