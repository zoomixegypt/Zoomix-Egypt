import { useEffect } from "react";
import { BriefcaseBusiness, Compass, Images, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n";
import { SITE_CONTACT } from "../data/siteSettings";
import { trackEvent } from "../utils/analytics";

export default function MobileBottomBar() {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isArabic = language === "ar";

  useEffect(() => {
    if (location.pathname === "/") document.body.classList.add("has-mobile-bottom-bar");
    else document.body.classList.remove("has-mobile-bottom-bar");
    return () => document.body.classList.remove("has-mobile-bottom-bar");
  }, [location.pathname]);

  if (location.pathname !== "/") return null;

  const items = [
    { href: "#packages-section", label: isArabic ? "الباقات" : "Packages", Icon: BriefcaseBusiness },
    { href: "#project-section", label: isArabic ? "الأعمال" : "Work", Icon: Images },
    { href: SITE_CONTACT.whatsappHref, label: isArabic ? "واتساب" : "WhatsApp", Icon: MessageCircle, external: true },
  ];

  return (
    <nav className="mobile-bottom-bar" dir={isArabic ? "rtl" : "ltr"} aria-label={isArabic ? "اختصارات الموقع" : "Site shortcuts"}>
      <div className="mobile-bottom-bar__inner">
        <button
          type="button"
          onClick={() => {
            trackEvent("mobile_bottom_bar_start", { destination: "route-finder" });
            navigate("/route-finder");
          }}
          className="mobile-bottom-bar__item mobile-bottom-bar__item--primary"
        >
          <Compass size={18} strokeWidth={1.8} aria-hidden="true" />
          <span>{isArabic ? "حدد" : "Choose"}</span>
        </button>
        {items.map(({ href, label, Icon, external }) => (
          <a
            key={label}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            onClick={() => trackEvent(external ? "click_whatsapp" : "mobile_bottom_bar_navigation", { destination: href })}
            className="mobile-bottom-bar__item"
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
