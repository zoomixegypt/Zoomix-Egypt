import { memo } from "react";
import { ArrowUpRight, Instagram, Linkedin, MessageCircle } from "lucide-react";
import { useLanguage } from "../i18n";
import ImageWithFallback from "./ImageWithFallback";

const Footer = memo(function Footer() {
  const { language, t } = useLanguage();
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const socials = [
    ["Instagram", "https://www.instagram.com/zoomixegypt", Instagram],
    ["TikTok", "https://www.tiktok.com/@zoomixegypt", ArrowUpRight],
    ["LinkedIn", "https://www.linkedin.com/in/zoomixegypt", Linkedin],
    ["X / Twitter", "https://x.com/zoomixegypt", ArrowUpRight],
  ];

  return (
    <footer
      id="footer-section"
      className="bg-[#0A0A0A] text-white pt-20 md:pt-24 pb-12 w-full relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12 relative z-10">
        <div className="flex items-center gap-4 mb-16 md:mb-24">
          <span className="w-2 h-2 bg-[#BBFF00]" aria-hidden="true" />
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/45">
            {t("footer", "label")}
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-20">
          <div className="lg:w-1/2">
            <ImageWithFallback
              src="/zoomix-logo.svg"
              alt="ZOOMIX"
              width="250"
              height="100"
              loading="lazy"
              className="w-44 h-auto mb-8 brightness-0 invert"
              fallbackClassName="aspect-[5/2] w-44 mb-8"
            />
            <p className="font-mono text-xs tracking-[0.2em] text-[#BBFF00] mb-6">
              {t("footer", "partner")}
            </p>
            <h2
              className={`${language === "ar" ? "font-arabic tracking-normal" : "font-display tracking-tighter"} text-5xl sm:text-7xl lg:text-8xl font-black uppercase leading-[0.9]`}
            >
              {t("footer", "title")} <br />
              <span className="text-[#BBFF00] italic">{t("footer", "accent")}</span>
            </h2>
            <p className="mt-8 max-w-md text-sm md:text-base text-white/60 leading-7">
              {t("footer", "description")}
            </p>
          </div>

          <div className="lg:w-1/3 flex flex-col gap-4">
            <span className="font-mono text-[10px] text-white/35 uppercase tracking-[0.2em] mb-3 border-l-2 border-[#BBFF00] pl-3">
              {t("footer", "sitemap")}
            </span>
            {[
              [t("nav", "about"), "about-section"],
              [t("nav", "work"), "project-section"],
              [t("nav", "contact"), "contact-section"],
            ].map(([label, id]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className="text-left font-mono text-xs md:text-sm uppercase tracking-[0.14em] text-white/65 hover:text-[#BBFF00] transition-colors flex items-center gap-3"
              >
                <span className="w-1.5 h-1.5 bg-white/25" aria-hidden="true" />
                {label}
              </button>
            ))}
            <div className="mt-6 pt-5 border-t border-white/10">
              <span className="font-mono text-[10px] text-white/35 uppercase tracking-[0.2em] mb-3 block">
                {t("footer", "socials")}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {socials.map(([label, href, Icon]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 border border-white/10 px-3 py-3 text-xs text-white/65 hover:border-[#BBFF00] hover:text-[#BBFF00] transition-colors"
                  >
                    <Icon size={14} aria-hidden="true" />
                    {label}
                  </a>
                ))}
              </div>
              <a
                href="https://wa.me/201555451535"
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center gap-2 border border-[#BBFF00]/50 px-3 py-3 text-xs text-[#BBFF00] hover:bg-[#BBFF00] hover:text-[#0A0A0A] transition-colors"
              >
                <MessageCircle size={14} aria-hidden="true" />
                {t("footer", "whatsapp")} +20 15 5545 1535
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-[10px] md:text-xs text-white/45 uppercase tracking-[0.16em]">
            {t("footer", "cairo")}
          </span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 font-mono text-[10px] md:text-xs uppercase tracking-[0.16em] text-[#BBFF00] hover:text-white transition-colors"
          >
            {t("footer", "top")} <ArrowUpRight size={14} aria-hidden="true" />
          </button>
          <span className="font-mono text-[10px] md:text-xs text-white/45 uppercase tracking-[0.16em]">
            © {new Date().getFullYear()} ZOOMIX
          </span>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
