import { ArrowUpLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { useLanguage } from "../i18n";
import { SELECTED_WORK_REFERENCES } from "../data/siteSettings";

export default function SelectedWorkReferences() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const ActionArrow = isArabic ? ArrowUpLeft : ArrowUpRight;

  return (
    <section
      id="selected-work-references"
      dir={isArabic ? "rtl" : "ltr"}
      className="border-t border-white/10 bg-[#0A0A0A] px-6 py-16 text-white md:px-12 md:py-24"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#BBFF00]">
              ZOOMIX / {isArabic ? "أعمال مختارة" : "SELECTED WORK"}
            </p>
            <h2 className={`${isArabic ? "font-arabic tracking-normal" : "font-display tracking-[-0.05em]"} mt-4 text-4xl font-black leading-none md:text-6xl`}>
              {isArabic ? "مراجع نختار منها بذكاء." : "References, chosen with intent."}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/55">
            {isArabic
              ? "اختارنا من أعمال Behance ما يوضح نوع المشاريع والمخرجات القريبة من طريقة Zoomix — بدون نقل تلقائي أو ادعاء نتائج غير موثقة."
              : "We selected Behance work that reflects the projects and outputs closest to Zoomix — without automatic copying or unverified claims."}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {SELECTED_WORK_REFERENCES.map((work, index) => (
            <article key={work.id} className="border border-white/15 bg-white/[0.03] p-5 transition-colors hover:border-[#BBFF00]/70 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-xs text-[#BBFF00]">0{index + 1}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">Behance</span>
              </div>
              <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{work.category[language]}</p>
              <h3 className="mt-3 text-2xl font-black leading-tight md:text-3xl">{work.title[language]}</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">{work.fit[language]}</p>
              <a
                href={work.href}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 border border-white/20 px-4 py-3 text-xs font-bold text-white transition-colors hover:border-[#BBFF00] hover:bg-[#BBFF00] hover:text-black"
              >
                {isArabic ? "شوف المشروع الكامل" : "View the full project"}
                <ExternalLink size={14} aria-hidden="true" />
                <ActionArrow size={14} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
