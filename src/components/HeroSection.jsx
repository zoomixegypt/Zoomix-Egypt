import { memo, useRef } from "react";
import { ArrowDownLeft, ArrowDownRight } from "lucide-react";
import { Gsap, useGsapScroll, useGsapTransform } from "../utils/gsapAnimate";
import { useLanguage } from "../i18n";
import ImageWithFallback from "./ImageWithFallback";

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
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="absolute -right-[18vw] bottom-[-20vw] h-[68vw] w-[68vw] rounded-full border border-white/20 shadow-[0_0_0_90px_rgba(255,255,255,.025),0_0_0_180px_rgba(255,255,255,.018)]" />
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
          <div className="zoomix-reveal zoomix-reveal-delay-3 relative z-10 -mx-2 mt-9 flex w-fit flex-wrap items-center gap-3 rounded-full bg-[#0A0A0A]/85 px-2 py-2">
            <a href="#contact-section" className="zoomix-button bg-[#BBFF00] text-black">
              {t("nav", "start")} <ActionArrow size={20} />
            </a>
            <a
              href="#project-section"
              className="zoomix-button bg-[#0A0A0A]/90 border-white/50 text-white"
            >
              {t("hero", "work")} <ActionArrow size={20} />
            </a>
          </div>
        </Gsap.div>
        <div
          className="pointer-events-none absolute bottom-10 left-6 right-6 z-0 hidden rounded-full bg-[#141A0A]/70 px-2 py-2 shadow-[0_0_0_1px_rgba(187,255,0,0.08),0_0_24px_rgba(187,255,0,0.08)] sm:block md:left-12 md:right-12"
          aria-hidden="true"
        >
          <div className="connection-line" />
        </div>
        <Gsap.div
          style={{ y: reduceMotion ? 0 : artY }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isRevealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.12 }}
          className="hidden lg:block border-r border-white/15 pr-9"
        >
          <ImageWithFallback
            src="/zoomix-logo.svg"
            alt="ZOOMIX"
            width="250"
            height="100"
            className="w-full max-w-sm mx-auto opacity-100 drop-shadow-[0_0_18px_rgba(255,255,255,0.08)]"
            fallbackClassName="aspect-[5/2] w-full max-w-sm mx-auto"
          />
          <p className="font-mono text-xs tracking-[.18em] text-white/40 mt-9 leading-6" dir="ltr">
            {t("hero", "build")}
            <br />
            {t("hero", "show")}
            <br />
            {t("hero", "launch")}
          </p>
        </Gsap.div>
      </div>
    </header>
  );
});
export default HeroSection;
