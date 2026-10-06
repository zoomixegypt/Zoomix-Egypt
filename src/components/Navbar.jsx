import { useState, memo, useEffect, useRef } from "react";
import { Gsap, GsapPresence } from "../utils/gsapAnimate";
import { Menu, X, ArrowUpRight, Crosshair } from "lucide-react";
import Magnetic from "./Magnetic";
import { exponentialEaseOut } from "../utils/easing";
import { useLanguage } from "../i18n";
import ZoomixLogo from "./ZoomixLogo";
import { useLocation, useNavigate } from "react-router-dom";

const DARK_SECTION_IDS = ["hero-section", "project-section", "packages-section", "contact-section"];

const Navbar = memo(function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const NAV_ITEMS = [
    { label: t("nav", "about"), sectionId: "about-section" },
    { label: t("nav", "services"), sectionId: "services-section" },
    { label: t("nav", "work"), sectionId: "project-section" },
    { label: t("nav", "packages"), sectionId: "packages-section" },
    { label: t("nav", "process"), sectionId: "process-section" },
    { label: t("nav", "contact"), sectionId: "contact-section" },
  ];
  const DESKTOP_NAV_ITEMS = NAV_ITEMS.filter(({ sectionId }) =>
    ["about-section", "services-section", "project-section", "contact-section"].includes(sectionId),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isOnDarkSection, setIsOnDarkSection] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const previousBodyOverflowRef = useRef("");
  const menuStoppedLenisRef = useRef(false);
  const isRouteFinderPage = location.pathname === "/route-finder";
  const logoOnDark = isOnDarkSection || (!scrolled && !isRouteFinderPage);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 50;
        setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));

        const probeY = 44;
        const nextOnDark = DARK_SECTION_IDS.some((sectionId) => {
          const el = document.getElementById(sectionId);
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.top <= probeY && rect.bottom >= probeY;
        });
        setIsOnDarkSection((prev) => (prev === nextOnDark ? prev : nextOnDark));

        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const lenis = window.lenisInstance;

    if (isMenuOpen) {
      previousBodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      if (lenis && typeof lenis.stop === "function") {
        lenis.stop();
        menuStoppedLenisRef.current = true;
      }

      return;
    }

    document.body.style.overflow = previousBodyOverflowRef.current;

    if (menuStoppedLenisRef.current && lenis && typeof lenis.start === "function") {
      lenis.start();
      menuStoppedLenisRef.current = false;
    }
  }, [isMenuOpen]);

  useEffect(
    () => () => {
      document.body.style.overflow = previousBodyOverflowRef.current;
    },
    [],
  );

  const scrollTo = (sectionId) => {
    setIsMenuOpen(false);

    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      return;
    }

    setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (!target) return;

      if (window.lenisInstance && typeof window.lenisInstance.scrollTo === "function") {
        window.lenisInstance.scrollTo(target, {
          offset: -24,
          duration: 1.5,
          easing: exponentialEaseOut,
        });
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100); // Small delay to let close animation start and avoid layout calculation stutter
  };

  const openRouteFinder = () => {
    setIsMenuOpen(false);
    navigate("/route-finder");
  };

  return (
    <nav
      aria-label={language === "ar" ? "التنقل الرئيسي" : "Primary navigation"}
      className={`fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-50 pointer-events-none transition-all duration-500`}
    >
      {/* ── Logo + fixed route finder signal ── */}
      <div className="nav-logo-lockup pointer-events-auto">
        <div className="nav-logo-backplate" aria-hidden="true">
          <span className="nav-logo-backplate__line" />
          <span className="nav-logo-backplate__dot" />
        </div>
        <Magnetic>
          <button
            type="button"
            onClick={() => {
              if (window.lenisInstance && typeof window.lenisInstance.scrollTo === "function") {
                window.lenisInstance.scrollTo(0, {
                  duration: 1.5,
                  easing: exponentialEaseOut,
                });
                return;
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-label="ZOOMIX"
            className={`nav-logo-button group relative z-10 flex items-center px-1.5 py-1 md:px-2 md:py-1.5 transition-all duration-500 cursor-pointer ${logoOnDark ? "" : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]"}`}
          >
            <ZoomixLogo
              variant={logoOnDark ? "dark" : "light"}
              className="h-auto w-24 md:w-32"
              width={180}
              height={60}
            />
          </button>
        </Magnetic>
      </div>

      {/* ── Mobile Menu Toggle ── */}
      <div className="lg:hidden pointer-events-auto relative z-50">
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? t("nav", "close") : t("nav", "menu")}
          aria-expanded={isMenuOpen}
          aria-controls="zoomix-mobile-menu"
          className={`w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md border transition-all duration-300 ${isMenuOpen ? "bg-white/85 border-black/10 text-black shadow-[0_8px_24px_rgba(0,0,0,0.08)]" : isOnDarkSection ? "bg-black/25 border-white/25 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)]" : scrolled ? "bg-white/85 border-black/10 text-black shadow-[0_8px_24px_rgba(0,0,0,0.08)]" : "bg-[#F5F4EF]/70 border-black/10 text-black"}`}
        >
          {isMenuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
        </button>
      </div>

      {/* ── Mobile Menu Overlay ── */}
      <GsapPresence>
        {isMenuOpen && (
          <Gsap.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className={`fixed inset-0 z-40 pointer-events-auto lg:hidden backdrop-blur-md overflow-hidden ${isOnDarkSection ? "bg-black/72" : "bg-[#F5F4EF]/96"}`}
            id="zoomix-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={language === "ar" ? "قائمة الموقع" : "Site menu"}
          >
            <div
              className={`absolute inset-0 opacity-[0.1] pointer-events-none [background-size:28px_28px] ${isOnDarkSection ? "[background-image:linear-gradient(to_right,rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.24)_1px,transparent_1px)]" : "[background-image:linear-gradient(to_right,rgba(0,0,0,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.16)_1px,transparent_1px)]"}`}
            />
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#BBFF00]/15 blur-3xl pointer-events-none" />
            <div
              className={`absolute -bottom-24 -left-10 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isOnDarkSection ? "bg-white/12" : "bg-white/40"}`}
            />
            <div
              className={`absolute inset-0 pointer-events-none ${isOnDarkSection ? "bg-[radial-gradient(circle_at_15%_5%,rgba(255,255,255,0.14),rgba(0,0,0,0)_48%)]" : "bg-[radial-gradient(circle_at_15%_5%,rgba(255,255,255,0.7),rgba(245,244,239,0)_48%)]"}`}
            />

            <Gsap.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 h-full w-full px-6 pt-24 pb-8 flex flex-col"
            >
              <div
                className={`w-full max-w-md mx-auto pb-4 border-b flex items-center justify-between ${isOnDarkSection ? "border-white/20" : "border-black/15"}`}
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.22em] ${isOnDarkSection ? "text-white/65" : "text-black/45"}`}
                >
                  Navigation Matrix
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BBFF00]" />
                  <span
                    className={`font-mono text-[10px] tracking-[0.14em] ${isOnDarkSection ? "text-white/55" : "text-black/35"}`}
                  >
                    MOBILE
                  </span>
                  <button
                    type="button"
                    onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                    aria-label="Switch language"
                    className={`ml-2 px-2 py-1 border rounded-full font-mono text-[10px] ${isOnDarkSection ? "border-white/25 text-white" : "border-black/15 text-black"}`}
                  >
                    {t("nav", "language")}
                  </button>
                </div>
              </div>

              <div className="w-full max-w-md mx-auto mt-6 flex-1 flex flex-col">
                {NAV_ITEMS.map((item, i) => (
                  <Gsap.button
                    key={item.sectionId}
                    onClick={() => scrollTo(item.sectionId)}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, delay: 0.05 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    className={`w-full border-b last:border-b-0 py-4 flex items-center justify-between text-left active:translate-x-0.5 transition-transform ${isOnDarkSection ? "border-white/20 active:bg-white/5" : "border-black/15 active:bg-black/5"}`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-[11px] font-mono font-bold tracking-[0.14em] ${isOnDarkSection ? "text-white/50" : "text-black/35"}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[30px] leading-none font-black uppercase tracking-tight ${isOnDarkSection ? "text-white" : "text-black/90"}`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`w-8 h-8 rounded-full border flex items-center justify-center ${isOnDarkSection ? "border-white/20" : "border-black/15"}`}
                    >
                      <ArrowUpRight
                        size={15}
                        className={`${isOnDarkSection ? "text-white/70" : "text-black/45"} ${language === "ar" ? "rotate-180" : ""}`}
                      />
                    </span>
                  </Gsap.button>
                ))}
              </div>

              <Gsap.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.28 }}
                onClick={() => scrollTo("contact-section")}
                className={`w-full max-w-md mx-auto mt-6 h-12 rounded-full text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.16)] ${isOnDarkSection ? "bg-white text-black" : "bg-black text-white"}`}
              >
                {t("nav", "start")}
                <ArrowUpRight size={14} className={language === "ar" ? "rotate-180" : ""} />
              </Gsap.button>

              <div
                className={`w-full max-w-md mx-auto mt-5 pt-4 border-t flex items-center justify-between ${isOnDarkSection ? "border-white/15" : "border-black/10"}`}
              >
                <span
                  className={`font-mono text-[10px] tracking-[0.14em] ${isOnDarkSection ? "text-white/55" : "text-black/35"}`}
                >
                  Select Section
                </span>
                <span
                  className={`font-mono text-[10px] tracking-[0.14em] ${isOnDarkSection ? "text-white/55" : "text-black/35"}`}
                >
                  Tap To Navigate
                </span>
              </div>
            </Gsap.div>
          </Gsap.div>
        )}
      </GsapPresence>

      {/* ── Desktop Menu (Floating Capsule with Gliding Pill) ── */}
      <div
        className={`hidden lg:flex items-center pointer-events-auto absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? "top-6 scale-100" : "top-8 scale-105"}`}
      >
        <div
          className={`flex items-center p-1.5 backdrop-blur-xl border shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-full relative transition-colors duration-500 ${isOnDarkSection ? "bg-black/25 border-white/25" : "bg-white/70 border-black/5"}`}
        >
          {DESKTOP_NAV_ITEMS.map((item, index) => (
            <Magnetic key={item.sectionId}>
              <button
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => scrollTo(item.sectionId)}
                className={`relative px-3 xl:px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] xl:tracking-[0.14em] transition-colors ${isOnDarkSection ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"}`}
              >
                <span className="relative z-10">{item.label}</span>
                {hoveredIndex === index && (
                  <Gsap.div
                    layoutId="navbar-pill"
                    className={`absolute inset-0 rounded-full z-0 ${isOnDarkSection ? "bg-white/10" : "bg-black/5"}`}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            </Magnetic>
          ))}
        </div>
      </div>

      {/* ── Desktop Right (Premium CTA) ── */}
      <div className="hidden lg:flex pointer-events-auto">
        <Magnetic>
          <div className="flex items-center gap-1 xl:gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              aria-label="Switch language"
              className={`px-2 xl:px-3 py-2.5 border rounded-full text-xs font-mono font-bold transition-colors ${isOnDarkSection ? "border-white/25 text-white hover:bg-white hover:text-black" : "border-black/15 text-black hover:bg-black hover:text-white"}`}
            >
              {t("nav", "language")}
            </button>
            <button
              onClick={() => scrollTo("contact-section")}
              className={`group relative overflow-hidden flex items-center gap-2 xl:gap-3 px-4 xl:px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] xl:tracking-[0.14em] hover:shadow-[0_0_30px_rgba(187,255,0,0.3)] transition-all duration-500 ${isOnDarkSection ? "bg-white text-black" : "bg-black text-white"}`}
            >
              {/* Core Label */}
              <span className="relative z-10 pl-2">{t("nav", "start")}</span>

              {/* Glowing Icon Container */}
              <div className="relative z-10 w-7 h-7 bg-[#BBFF00] rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-transform duration-300">
                <ArrowUpRight
                  size={14}
                  strokeWidth={2.5}
                  className={`${language === "ar" ? "rotate-180" : ""} group-hover:rotate-45 transition-transform duration-300`}
                />
              </div>
            </button>
          </div>
        </Magnetic>
      </div>

      {!isRouteFinderPage && scrolled && (
        <button
          type="button"
          onClick={openRouteFinder}
          dir={language === "ar" ? "rtl" : "ltr"}
          className={`route-finder-fixed-entry pointer-events-auto group ${isOnDarkSection ? "route-finder-fixed-entry--dark" : "route-finder-fixed-entry--light"}`}
          aria-label={language === "ar" ? "ساعدني أختار الطريق المناسب" : "Help me find the right route"}
        >
          <span className="route-finder-fixed-entry__line" aria-hidden="true" />
          <span className="route-finder-fixed-entry__node" aria-hidden="true">
            <Crosshair size={12} strokeWidth={1.8} />
          </span>
          <span className="route-finder-fixed-entry__copy">
            <span className="route-finder-fixed-entry__eyebrow">ZOOMIX / NEXT MOVE</span>
            <span>{language === "ar" ? "مش عارف تبدأ؟ نحددها سوا" : "Not sure where to start? Find your route"}</span>
          </span>
        </button>
      )}
    </nav>
  );
});

export default Navbar;
