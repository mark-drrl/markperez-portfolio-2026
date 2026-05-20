import LuxuryCursor from "@/components/LuxuryCursor";
import WorksLsbGallery from "@/components/WorksLsbGallery";
import WorksLsbPlayerControls from "@/components/WorksLsbPlayerControls";
import { workPageSocialLinks } from "@/constants/workPageSocialLinks";
import Link from "next/link";

const imageItems = [
  { type: "image", src: "/lsb/lsb-1.jpg", className: "w-[108%] aspect-[4/5]" },
  { type: "image", src: "/lsb/lsb-2.png", className: "-mt-14 w-[124%] aspect-[4/5]" },
  { type: "image", src: "/lsb/lsb-3.png", className: "w-[96%] aspect-[3/4]" },
  { type: "image", src: "/lsb/lsb-4.png", className: "w-[96%] aspect-[3/4]" },
  { type: "image", src: "/lsb/lsb-5.png", className: "w-[96%] aspect-[3/4]" },
  { type: "image", src: "/lsb/lsb-6.png", className: "w-[104%] aspect-[4/5]" },
] as const;

const reelItems = [
  { type: "video", src: "/lsb/VALENTINES.mp4", className: "w-[90%] aspect-[9/16]" },
  { type: "video", src: "/lsb/COMMERCIAL_IVwVO.mp4", className: "w-[90%] aspect-[4/5]" },
  { type: "video", src: "/lsb/lsb-7.mp4", className: "w-[90%] aspect-[9/16]" },
  { type: "video", src: "/lsb/lsb-8.mp4", className: "w-[90%] aspect-[9/16]" },
  { type: "video", src: "/lsb/lsb-9.mp4", className: "w-[90%] aspect-[9/16]" },
  { type: "video", src: "/lsb/lsb-10.mp4", className: "w-[90%] aspect-[9/16]" },
  { type: "video", src: "/lsb/lsb-news.mp4", className: "w-[90%] aspect-[4/5]" },
] as const;

const socialButtons = workPageSocialLinks;


export default function WorksLsbPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#E5E5E3] text-[#151515]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-[#E5E5E3] via-[#E5E5E3]/82 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-[#E5E5E3] via-[#E5E5E3]/78 to-transparent" />

      <section className="relative z-30 grid h-full grid-cols-1 items-center px-[10vw] md:grid-cols-[1fr_minmax(300px,33vw)_1fr] md:gap-[7vw] md:px-[8vw]">
        <div className="absolute bottom-12 left-5 z-30 flex justify-start md:static md:flex md:justify-end">
          <div className="flex flex-col items-start md:items-end">
            <h1 className="font-editorial max-w-[220px] text-left text-[clamp(25px,2.1vw,38px)] md:text-right leading-[0.86] tracking-[0.12em]">
              LSB YACHT
              <br />
              CHARTER
            </h1>
            <WorksLsbPlayerControls />
          </div>
        </div>

        <div className="relative mx-auto h-screen w-full max-w-[82vw] overflow-hidden md:max-w-[420px]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[22vh] bg-gradient-to-b from-[#E5E5E3] via-[#E5E5E3]/72 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[22vh] bg-gradient-to-t from-[#E5E5E3] via-[#E5E5E3]/72 to-transparent" />

          <WorksLsbGallery imageItems={imageItems} reelItems={reelItems} />
        </div>

        <div className="hidden max-w-[360px] grid-cols-[1px_1fr] gap-14 md:grid">
          <div className="h-[225px] w-px self-center bg-[#9F1F2E]" />
          <div className="font-neue self-center text-[11px] leading-[1.25] text-black/58">
            <p className="max-w-[300px]">
              Luxury Sea Boats is a premier Dubai-based yacht charter
              distinguished by its exclusive ownership and operation of an elite
              fleet featuring prestigious Benetti, Sunseeker, and Azimut yachts.
            </p>
            <a
              href="https://www.instagram.com/lsb_yachts/"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block text-[9px] uppercase tracking-[0.22em] text-black/38 transition-colors hover:text-[#9F1F2E] [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]"
            >
              VISIT THEIR INSTAGRAM
            </a>

            <p className="mt-9 whitespace-pre-line text-[9px] uppercase leading-[1.45] tracking-[0.22em] text-black/38 [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]">
              SONY A7IV <span className="text-[#9F1F2E]">{"//"}</span> SIGMA
              {"\n"}PHOTOGRAPHY
              {"\n"}VIDEOGRAPHY
              {"\n"}DAVINCI RESOLVE
              {"\n"}ADOBE PHOTOSHOP
              {"\n"}ADOBE LIGHTROOM
              {"\n"}SOCIAL MEDIA MANAGEMENT
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
