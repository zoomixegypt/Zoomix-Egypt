import { memo } from "react";
import { useLanguage } from "../i18n";

const MarqueeBanner = memo(function MarqueeBanner() {
  const { language } = useLanguage();
  const skills =
    language === "ar"
      ? [
          { label: "هوية", target: "services-section" },
          { label: "محتوى", target: "project-section" },
          { label: "تصوير", target: "project-section" },
          { label: "مطبوعات", target: "services-section" },
          { label: "صفحات هبوط", target: "packages-section" },
          { label: "إطلاق", target: "contact-section" },
        ]
      : [
          { label: "IDENTITY", target: "services-section" },
          { label: "CONTENT", target: "project-section" },
          { label: "PHOTOGRAPHY", target: "project-section" },
          { label: "PRINT", target: "services-section" },
          { label: "LANDING PAGES", target: "packages-section" },
          { label: "LAUNCH", target: "contact-section" },
        ];
  const marqueeFont =
    language === "ar" ? "font-arabic tracking-normal" : "font-display tracking-[-0.03em]";
  const scrollToSkill = (target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="relative z-20 sm:-rotate-[0.8deg] sm:scale-[1.02] cursor-default select-none"
    >
      <div className="bg-black shadow-[0_0_40px_rgba(187,255,0,0.12)]">
        {/* ── Row 1: Solid Lime Text, scrolling left ── */}
        <div className="py-4 md:py-6 overflow-hidden relative group border-b border-neutral-800/60">
          <div
            className="flex whitespace-nowrap gap-6 md:gap-14 will-change-transform group-hover:[animation-play-state:paused]"
            dir="ltr"
            style={{
              animation: `${language === "ar" ? "marquee-scroll-right" : "marquee-scroll-left"} 28s linear infinite`,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`flex gap-6 md:gap-14 text-lg sm:text-2xl md:text-4xl font-extrabold uppercase items-center ${marqueeFont}`}
              >
                {skills.map((skill, j) => (
                  <span key={j} className="flex items-center gap-6 md:gap-14">
                    <button
                      type="button"
                      onClick={() => scrollToSkill(skill.target)}
                      className="text-[#BBFF00] hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(187,255,0,0.6)]"
                    >
                      {skill.label}
                    </button>
                    <span className="text-[#BBFF00]/30 text-xs">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Edge Fades */}
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        </div>

        {/* ── Row 2: Green background, scrolling right ── */}
        <div className="py-2.5 md:py-4 bg-[#BBFF00] overflow-hidden relative group">
          <div
            className="flex whitespace-nowrap gap-6 md:gap-12 will-change-transform group-hover:[animation-play-state:paused]"
            dir="ltr"
            style={{
              animation: `${language === "ar" ? "marquee-scroll-left" : "marquee-scroll-right"} 32s linear infinite`,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`flex gap-6 md:gap-12 text-base sm:text-lg md:text-2xl font-extrabold uppercase items-center ${marqueeFont}`}
              >
                {skills.map((skill, j) => (
                  <span key={j} className="flex items-center gap-6 md:gap-12">
                    <button
                      type="button"
                      onClick={() => scrollToSkill(skill.target)}
                      className="text-black hover:text-white transition-colors duration-300"
                    >
                      {skill.label}
                    </button>
                    <span className="text-black/25 text-xs">◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Edge Fades */}
          <div className="absolute inset-y-0 left-0 w-12 md:w-24 bg-gradient-to-r from-[#BBFF00] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 md:w-24 bg-gradient-to-l from-[#BBFF00] to-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
});

export default MarqueeBanner;
