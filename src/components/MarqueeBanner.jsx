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
        <div className="relative overflow-hidden border-b border-neutral-800/60 py-3 sm:py-4 md:py-6">
          <div
            className="group flex w-max whitespace-nowrap gap-5 will-change-transform hover:[animation-play-state:paused] sm:gap-8 md:gap-14"
            dir="ltr"
            style={{
              animation: `${language === "ar" ? "marquee-scroll-right" : "marquee-scroll-left"} 28s linear infinite`,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-5 text-base font-extrabold uppercase sm:gap-8 sm:text-2xl md:gap-14 md:text-4xl ${marqueeFont}`}
              >
                {skills.map((skill, j) => (
                  <span key={j} className="flex items-center gap-5 sm:gap-8 md:gap-14">
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
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-black to-transparent sm:w-16 md:w-32" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-black to-transparent sm:w-16 md:w-32" />
        </div>

        {/* ── Row 2: Green background, scrolling right ── */}
        <div className="relative overflow-hidden bg-[#BBFF00] py-2 sm:py-3 md:py-4">
          <div
            className="group flex w-max whitespace-nowrap gap-5 will-change-transform hover:[animation-play-state:paused] sm:gap-8 md:gap-12"
            dir="ltr"
            style={{
              animation: `${language === "ar" ? "marquee-scroll-left" : "marquee-scroll-right"} 32s linear infinite`,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-5 text-sm font-extrabold uppercase sm:gap-8 sm:text-lg md:gap-12 md:text-2xl ${marqueeFont}`}
              >
                {skills.map((skill, j) => (
                  <span key={j} className="flex items-center gap-5 sm:gap-8 md:gap-12">
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
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#BBFF00] to-transparent sm:w-12 md:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#BBFF00] to-transparent sm:w-12 md:w-24" />
        </div>
      </div>
    </div>
  );
});

export default MarqueeBanner;
