import { memo } from "react";
import { ArrowUpLeft, ArrowUpRight, Clock3, Instagram, Mail, MessageCircle } from "lucide-react";
import { useLanguage } from "../i18n";
import ZoomixLogo from "./ZoomixLogo";
import { SITE_CONTACT } from "../data/siteSettings";

const Footer = memo(function Footer() {
  const { language, t } = useLanguage();
  const ActionArrow = language === "ar" ? ArrowUpLeft : ArrowUpRight;
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const socials = [
    ["Instagram", "https://www.instagram.com/zoomixegypt", Instagram],
    ["TikTok", "https://www.tiktok.com/@zoomixegypt", ArrowUpRight],
    ["X / Twitter", "https://x.com/zoomixegypt", ArrowUpRight],
  ];

  return (
    <footer
      id="footer-section"
      dir={language === "ar" ? "rtl" : "ltr"}
      className="relative w-full overflow-hidden bg-[#0A0A0A] pt-20 pb-12 text-white md:pt-24"
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

        <div className="mb-20 flex flex-col justify-between gap-12 lg:flex-row">
          <div className="lg:w-1/2">
            <ZoomixLogo
              variant="dark"
              width={250}
              height={100}
              className="mb-8 w-44"
              loading="lazy"
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
            <a
              href="/route-finder"
              className="footer-route-cta mt-8 inline-flex w-full items-center justify-between gap-4 border border-[#BBFF00]/60 bg-[#BBFF00] px-4 py-4 font-bold text-[#0A0A0A] transition-transform hover:-translate-y-0.5 sm:w-fit"
            >
              <span>{language === "ar" ? "اختيار سريع — 3 أسئلة" : "Quick match — 3 questions"}</span>
              <ActionArrow size={18} aria-hidden="true" />
            </a>
          </div>

          <div className="lg:w-1/3 flex flex-col gap-4">
            <span className="mb-3 border-s-2 border-[#BBFF00] ps-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
              {t("footer", "sitemap")}
            </span>
            {[
              [t("nav", "about"), "about-section"],
              [t("nav", "services"), "services-section"],
              [t("nav", "work"), "project-section"],
              [t("nav", "packages"), "packages-section"],
              [t("nav", "process"), "process-section"],
              [t("nav", "contact"), "contact-section"],
            ].map(([label, id]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className="flex items-center gap-3 text-start font-mono text-xs uppercase tracking-[0.14em] text-white/75 transition-colors hover:text-[#BBFF00] md:text-sm"
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
                    className="flex min-w-0 items-center gap-2 border border-white/15 px-3 py-3 text-xs text-white/75 transition-colors hover:border-[#BBFF00] hover:text-[#BBFF00]"
                  >
                    <Icon size={14} aria-hidden="true" />
                    {label}
                  </a>
                ))}
              </div>
              <a
                href={SITE_CONTACT.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center gap-2 border border-[#BBFF00]/70 px-3 py-3 text-xs text-[#BBFF00] transition-colors hover:bg-[#BBFF00] hover:text-[#0A0A0A]"
              >
                <MessageCircle size={14} aria-hidden="true" />
                <span>{t("footer", "whatsapp")}</span>
                <span dir="ltr">{SITE_CONTACT.whatsapp}</span>
              </a>
              <a
                href={`mailto:${SITE_CONTACT.email}`}
                className="mt-2 flex items-center gap-2 border border-white/15 px-3 py-3 text-xs text-white/75 transition-colors hover:border-[#BBFF00] hover:text-[#BBFF00]"
              >
                <Mail size={14} aria-hidden="true" />
                <span dir="ltr">{SITE_CONTACT.email}</span>
              </a>
              <div className="mt-2 flex items-start gap-2 border border-white/15 px-3 py-3 text-xs leading-5 text-white/60">
                <Clock3 size={14} className="mt-0.5 shrink-0 text-[#BBFF00]" aria-hidden="true" />
                <span>{SITE_CONTACT.hours[language]}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center md:flex-row md:text-start">
          <span className="font-mono text-[10px] md:text-xs text-white/45 uppercase tracking-[0.16em]">
            {t("footer", "cairo")}
          </span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label={t("footer", "top")}
              className="inline-flex items-center gap-2 font-mono text-[10px] md:text-xs uppercase tracking-[0.16em] text-[#BBFF00] hover:text-white transition-colors"
          >
            {t("footer", "top")}{" "}
            <ArrowUpRight
              size={14}
              className={language === "ar" ? "rotate-180" : ""}
              aria-hidden="true"
            />
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
