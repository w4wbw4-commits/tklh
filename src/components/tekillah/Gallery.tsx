// ---------------------------------------------------------------------------
// Gallery — Elegant grid showcasing sample work per service line.
// Images live in /public/gallery/*.jpg so the client can drop-in replace
// them anytime without touching code. To add/reorder items, edit
// the `galleryItems` array below.
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import heroPrepVideo from "../../../public/gallery/hero-prep.mp4.asset.json";

type GalleryItem = {
  src: string;
  /** Optional looping video that replaces the still image (e.g. hero card). */
  videoSrc?: string;
  titleAr: string;
  titleEn: string;
  captionAr: string;
  captionEn: string;
};

// ⬇️  Replace image paths (or drop new jpgs into /public/gallery/) to update.
export const galleryItems: GalleryItem[] = [
  {
    src: "/gallery/weddings.jpg", // used as poster/fallback for the video card
    videoSrc: heroPrepVideo.url,
    titleAr: "أعراس وزواج",
    titleEn: "Weddings",
    captionAr: "كوش، ديكور، وتنسيق كامل",
    captionEn: "Stages, décor & full styling",
  },
  {
    src: "/gallery/corporate.jpg",
    titleAr: "فعاليات ومؤتمرات",
    titleEn: "Corporate Events",
    captionAr: "مؤتمرات وفعاليات مؤسسية",
    captionEn: "Conferences & corporate summits",
  },
  {
    src: "/gallery/catering.jpg",
    titleAr: "ضيافة وتموين",
    titleEn: "Catering",
    captionAr: "بوفيهات، قهوة عربية، وحلا",
    captionEn: "Buffets, Arabic coffee & sweets",
  },
  {
    src: "/gallery/photography.jpg",
    titleAr: "تصوير احترافي",
    titleEn: "Photography",
    captionAr: "توثيق كامل للمناسبة بلمسة سينمائية",
    captionEn: "Cinematic full-event coverage",
  },
];

export const Gallery = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <section
      id="gallery"
      dir={isAr ? "rtl" : "ltr"}
      className="relative w-full py-20 md:py-28"
      style={{ backgroundColor: "hsl(var(--cream))" }}
    >
      {/* subtle top/bottom fade into cream */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{
              borderColor: "hsl(var(--gold) / 0.5)",
              color: "hsl(var(--gold))",
              backgroundColor: "hsl(var(--gold) / 0.08)",
            }}
          >
            {isAr ? "معرض أعمالنا" : "Our Work"}
          </span>
          <h2
            className="mt-4 font-display font-black text-primary-deep"
            style={{ letterSpacing: "-0.01em" }}
          >
            {isAr ? "لمحات من فعاليات تِكله" : "Glimpses of Tklh Events"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-primary-deep/75 sm:text-base">
            {isAr
              ? "نماذج مختارة من أعراسنا، فعالياتنا المؤسسية، تموين الضيافة، والتصوير الاحترافي."
              : "Selected samples across weddings, corporate events, catering & photography."}
          </p>
          {/* Gold hairline divider */}
          <div
            className="mt-6 h-px w-24"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.8), transparent)",
            }}
          />
        </div>

        {/* Bento grid: 1 col mobile → 2 cols md → 4 cols lg */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {galleryItems.map((item, i) => (
            <motion.figure
              key={item.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl border shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-card-hover"
              style={{ borderColor: "hsl(var(--gold) / 0.25)" }}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <img
                  src={item.src}
                  alt={isAr ? item.titleAr : item.titleEn}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Olive gradient overlay for text legibility */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 40%, hsl(151 43% 10% / 0.55) 70%, hsl(151 43% 10% / 0.92) 100%)",
                  }}
                />
                {/* Hover gold accent line */}
                <div
                  aria-hidden
                  className="absolute inset-x-4 bottom-[92px] h-px origin-center scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: "hsl(var(--gold))" }}
                />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <div
                  className="font-display text-lg font-black leading-tight"
                  style={{ color: "hsl(var(--cream))" }}
                >
                  {isAr ? item.titleAr : item.titleEn}
                </div>
                <div
                  className="mt-1 text-[12.5px]"
                  style={{ color: "hsl(var(--gold-soft))" }}
                >
                  {isAr ? item.captionAr : item.captionEn}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};
