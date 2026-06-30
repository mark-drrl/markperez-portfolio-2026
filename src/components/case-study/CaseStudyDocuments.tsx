"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import type { CaseStudyContent, CaseStudyDocument } from "@/constants/caseStudies/types";
import CaseStudyDocumentViewer from "./CaseStudyDocumentViewer";
import { CASE_EASE, monoClass } from "./caseStudyStyles";

interface CaseStudyDocumentsProps {
  content: CaseStudyContent;
}

function DocumentCard({
  doc,
  index,
  onOpen,
}: {
  doc: CaseStudyDocument;
  index: number;
  onOpen: (doc: CaseStudyDocument) => void;
}) {
  const isFeatured = doc.featured;
  const aspect = doc.aspect ?? "aspect-[3/4]";

  return (
    <motion.button
      type="button"
      data-cursor-interactive="true"
      onClick={() => onOpen(doc)}
      className={`group relative block w-full overflow-hidden bg-[#dddcd9] text-left ring-1 ring-black/[0.06] ${
        isFeatured ? `mx-auto max-w-[1200px] ${aspect}` : `${aspect} w-full`
      }`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{
        duration: 0.9,
        ease: CASE_EASE,
        delay: 0.04 * (index % 3),
      }}
    >
      <Image
        src={doc.coverSrc}
        alt={doc.title}
        fill
        sizes={isFeatured ? "1200px" : "(min-width: 768px) 33vw, 90vw"}
        className="object-contain p-2 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] md:p-3"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent p-5 md:p-6">
        <p
          className={`text-[10px] uppercase tracking-[0.28em] text-white/70 ${monoClass}`}
        >
          {doc.subtitle ?? "Lookbook"}
        </p>
        <p className="font-editorial mt-2 text-[clamp(1.25rem,2.4vw,2rem)] font-light leading-none text-white">
          {doc.title}
        </p>
        <p
          className={`mt-3 text-[10px] uppercase tracking-[0.24em] text-white/55 ${monoClass}`}
        >
          {doc.pageCount} pages · Turn pages
        </p>
      </div>
      <span
        className={`absolute left-4 top-4 text-[10px] uppercase tracking-[0.24em] text-black/45 ${monoClass}`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </motion.button>
  );
}

export default function CaseStudyDocuments({ content }: CaseStudyDocumentsProps) {
  const documents = content.documents;

  const [activeDocument, setActiveDocument] = useState<CaseStudyDocument | null>(
    null,
  );

  if (!documents || documents.items.length === 0) {
    return null;
  }

  const featured = documents.items.filter((item) => item.featured);
  const catalog = documents.items.filter((item) => !item.featured);

  return (
    <>
      <section className="relative bg-[#E5E5E3] px-5 py-[16vh] text-[#151515] md:px-8">
        <div className="flex items-baseline justify-between gap-6">
          <span
            className={`text-[10px] uppercase tracking-[0.3em] text-black/40 ${monoClass}`}
          >
            {documents.label}
          </span>
          <h2 className="font-editorial text-[clamp(1.6rem,3vw,2.6rem)] font-light italic leading-none">
            {documents.heading}
          </h2>
        </div>

        {documents.intro ? (
          <p className="font-neue mt-8 max-w-[52ch] text-[15px] leading-[1.6] text-black/58">
            {documents.intro}
          </p>
        ) : null}

        <div className="mt-10 space-y-4">
          {featured.map((doc, index) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              index={index}
              onOpen={setActiveDocument}
            />
          ))}
        </div>

        {catalog.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {catalog.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                index={index + featured.length}
                onOpen={setActiveDocument}
              />
            ))}
          </div>
        ) : null}
      </section>

      <CaseStudyDocumentViewer
        document={activeDocument}
        onClose={() => setActiveDocument(null)}
      />
    </>
  );
}
