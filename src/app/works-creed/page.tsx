import WorksSorenGallery from "@/components/WorksSorenGallery";
import LuxuryCursor from "@/components/LuxuryCursor";
import { workPageSocialLinks } from "@/constants/workPageSocialLinks";
import Link from "next/link";

const galleryItems = [
  { type: "image", src: "/creed/g3.jpg", className: "w-[92%]" },
  {
    type: "video",
    src: "https://www.youtube.com/embed/-eg0Ka6brwk?rel=0&modestbranding=1",
    className: "w-[112%] aspect-video",
  },
  { type: "image", src: "/creed/g1.png", className: "w-[90%]" },
  { type: "image", src: "/creed/g2.png", className: "w-[88%]" },
  {
    type: "image",
    src: "/creed/hf_20260606_220629_8d72ccc7-df6a-42cd-83ab-054619808f1d.png",
    className: "w-[90%]",
  },
  {
    type: "image",
    src: "/creed/hf_20260606_222605_2180e20d-97b0-40aa-92ec-9f9ad6a60b19 (1).png",
    className: "w-[86%]",
  },
  {
    type: "image",
    src: "/creed/hf_20260606_223248_c58ab2cc-a121-42a5-bcd7-bc8940de3b59.png",
    className: "w-[90%]",
  },
  {
    type: "image",
    src: "/creed/hf_20260607_095146_d261605c-d116-4657-b23b-962699532470.png",
    className: "mx-auto mb-[32vh] w-[88%]",
  },
] as const;

const socialButtons = workPageSocialLinks;

export default function WorksCreedPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#E5E5E3] text-[#151515]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-[#E5E5E3] via-[#E5E5E3]/82 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-[#E5E5E3] via-[#E5E5E3]/78 to-transparent" />

      <section className="relative z-10 grid h-full grid-cols-1 items-center px-[10vw] md:grid-cols-[1fr_minmax(300px,33vw)_1fr] md:gap-[7vw] md:px-[8vw]">
        <div className="absolute bottom-12 left-5 z-30 flex justify-start md:static md:flex md:justify-end">
          <h1 className="font-editorial max-w-[220px] text-left text-[clamp(25px,2.1vw,38px)] md:text-right leading-[0.86] tracking-[0.12em]">
            CREED
          </h1>
        </div>

        <div className="relative mx-auto h-screen w-full max-w-[82vw] overflow-hidden md:max-w-[420px]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[22vh] bg-gradient-to-b from-[#E5E5E3] via-[#E5E5E3]/72 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[22vh] bg-gradient-to-t from-[#E5E5E3] via-[#E5E5E3]/72 to-transparent" />

          <WorksSorenGallery items={galleryItems} projectName="Creed" />
        </div>

        <div className="hidden max-w-[360px] grid-cols-[1px_1fr] gap-14 md:grid">
          <div className="h-[225px] w-px self-center bg-[#9F1F2E]" />
          <div className="font-neue self-center text-[11px] leading-[1.25] text-black/58">
            <p className="max-w-[300px]">
              A visual study in contrast and craft — cinematic frames, editorial
              stills, and motion built for the Creed campaign.
            </p>

            <p className="mt-9 whitespace-pre-line text-[9px] uppercase leading-[1.45] tracking-[0.22em] text-black/38 [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]">
              AI IMAGE GENERATION
              {"\n"}AI VIDEO GENERATION
              {"\n"}CHATGPT IMAGE 2.0
              {"\n"}KLING 3.0
              {"\n"}DAVINCI RESOLVE
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
