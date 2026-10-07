import { memo, useRef } from "react";
import { ArrowDownLeft, ArrowDownRight, Compass } from "lucide-react";
import { Gsap, useGsapScroll, useGsapTransform } from "../utils/gsapAnimate";
import { useLanguage } from "../i18n";
import ZoomixLogo from "./ZoomixLogo";

const HeroSection = memo(function HeroSection({ isRevealed = true }) {
  const { language, t } = useLanguage();
  const ref = useRef(null);
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { scrollYProgress } = useGsapScroll({ target: ref, offset: ["start start", "end start"] });
  const artY = useGsapTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const ActionArrow = language === "ar" ? ArrowDownLeft : ArrowDownRight;
  return (
    <header
      ref={ref}
      id="hero-section"
      dir={language === "ar" ? "rtl" : "ltr"}
      className="min-h-[100svh] bg-[#0A0A0A] text-white relative overflow-hidden flex flex-col justify-start pt-32 pb-12 lg:justify-center lg:flex-row lg:items-end md:pb-24 md:pt-28"
    >
      <div className="hero-grid absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="hero-orbit absolute -right-[18vw] bottom-[-20vw] h-[68vw] w-[68vw] rounded-full border border-white/20 shadow-[0_0_0_90px_rgba(255,255,255,.025),0_0_0_180px_rgba(255,255,255,.018)]" />
      <div className="relative z-10 w-full max-w-[1380px] mx-auto px-6 md:px-12 grid lg:grid-cols-[1.2fr_.8fr] gap-12 items-end">
        <Gsap.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <p
            className="zoomix-reveal font-mono text-[11px] tracking-[.2em] text-[#BBFF00] mb-7"
            dir="ltr"
          >
            {t("hero", "eyebrow")}
          </p>
          <h1
            className={`zoomix-reveal zoomix-reveal-delay-1 ${language === "ar" ? "font-arabic tracking-normal leading-[1.12]" : "font-display tracking-[-.06em] leading-[.98]"} text-[clamp(2.75rem,12vw,8.7rem)] sm:text-[clamp(3.6rem,9vw,8.7rem)] font-extrabold max-w-4xl break-words`}
          >
            {t("hero", "titleA")} <span className="text-[#BBFF00]">{t("hero", "titleAccent")}</span>
            <br />
            {t("hero", "titleB")}
          </h1>
          <p
            className={`zoomix-reveal zoomix-reveal-delay-2 ${language === "ar" ? "font-arabic leading-[1.9]" : "font-display leading-8"} text-white/75 max-w-xl mt-7 text-base md:text-lg`}
          >
            {t("hero", "description")}
          </p>
          <p className="zoomix-reveal zoomix-reveal-delay-2 mt-3 max-w-xl text-sm leading-6 text-[#BBFF00]/80">
            {t("hero", "partnerLine")}
          </p>
          <div className="hero-cta-group zoomix-reveal zoomix-reveal-delay-3 relative z-10 -mx-2 mt-9 flex w-fit flex-wrap items-center gap-3 rounded-full bg-[#0A0A0A]/85 px-2 py-2">
            <a href="/route-finder" className="hero-cta-primary zoomix-button bg-[#BBFF00] text-black">
              <Compass className="hero-start-icon" size={18} aria-hidden="true" />
              {language === "ar" ? "اختيار سريع" : "QUICK MATCH"} <ActionArrow size={20} />
            </a>
            <a
              href="#project-section"
              className="hero-cta-secondary zoomix-button bg-[#0A0A0A]/90 border-white/50 text-white"
            >
              {t("hero", "work")} <ActionArrow size={20} />
            </a>
          </div>
        </Gsap.div>
        <div
          className="pointer-events-none absolute bottom-2 left-6 right-6 z-10 hidden rounded-full bg-transparent sm:block md:left-12 md:right-12"
          aria-hidden="true"
        >
          <div className="connection-line hero-connection-line translate-y-1.5" />
          <p
            className="absolute left-1/2 top-10 flex -translate-x-1/2 items-center gap-7 whitespace-nowrap bg-[#0A0A0A]/85 px-2 py-1 font-mono text-[18px] leading-6 tracking-[.16em] text-white/60"
            dir="ltr"
          >
            <span>{t("hero", "build")}</span>
            <span aria-hidden="true" className="text-[#BBFF00]/60">
              /
            </span>
            <span>{t("hero", "show")}</span>
            <span aria-hidden="true" className="text-[#BBFF00]/60">
              /
            </span>
            <span>{t("hero", "launch")}</span>
          </p>
        </div>
        <Gsap.div
          style={{ y: reduceMotion ? 0 : artY }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isRevealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.12 }}
          className="hidden self-end border-r border-white/15 pb-16 pr-9 lg:block lg:-translate-y-4"
        >
          <ZoomixLogo
            variant="dark"
            width={250}
            height={100}
            className="mx-auto w-full max-w-sm drop-shadow-[0_0_18px_rgba(255,255,255,0.08)]"
          />
        </Gsap.div>
      </div>
    </header>
  );
});
export default HeroSection;
