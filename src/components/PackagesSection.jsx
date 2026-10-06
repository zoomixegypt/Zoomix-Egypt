import { memo } from "react";
import { Check } from "lucide-react";
import { useLanguage } from "../i18n";
import { Gsap } from "../utils/gsapAnimate";
import { ZOOMIX_PACKAGES } from "../data/zoomixPackages";
import { trackEvent } from "../utils/analytics";
import {
  ZOOMIX_CONTENT_PACKAGES,
  ZOOMIX_EVENT_PACKAGES,
  ZOOMIX_ONE_OFF_SERVICES,
  ZOOMIX_PARTNER_PACKAGES,
} from "../data/zoomixOfferings";

const labelFor = (value, language) => value?.[language] || value || "";

function saveSelection(route, offerId, isStart = false, language = "ar") {
  const selection = { route, packageId: offerId, savedAt: new Date().toISOString() };
  if (isStart) {
    window.localStorage.setItem("zoomix-selected-package", offerId);
  } else {
    window.localStorage.removeItem("zoomix-selected-package");
  }
  window.localStorage.setItem("zoomix-project-route", JSON.stringify(selection));
  if (isStart) {
    window.dispatchEvent(new CustomEvent("zoomix:package-select", { detail: offerId }));
  }
  window.dispatchEvent(new CustomEvent("zoomix:route-select", { detail: selection }));
  trackEvent("choose_package", { package_id: offerId, source_section: "packages", language });
  document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function OfferTierCard({ offer, language, route, isStart, index }) {
  const isArabic = language === "ar";
  const name = labelFor(offer.name, language);
  const description = labelFor(offer.description || offer.tagline, language);
  const outputs = offer.outputs?.[language] || [];
  const visibleOutputs = outputs.slice(0, 4);
  const hiddenOutputs = outputs.slice(4);
  const priceSuffix = route === "continue" ? (isArabic ? "جنيه / شهريًا" : "EGP / month") : isArabic ? "جنيه" : "EGP";
  const note = offer.duration
    ? `${isArabic ? "المدة:" : "Duration:"} ${labelFor(offer.duration, language)}`
    : labelFor(offer.priceNote, language);

  return (
    <Gsap.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: "easeOut" }}
      data-featured={offer.featured ? "true" : undefined}
      className={`offer-tier-card flex h-full flex-col border p-5 md:p-6 ${offer.featured ? "border-[#BBFF00] bg-[#BBFF00]/[0.07]" : "border-white/15 bg-white/[0.02]"}`}
    >
      {offer.featured && (
        <span className="mb-5 self-start bg-[#BBFF00] px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-[#0A0A0A]">
          {isArabic ? "المقترحة" : "RECOMMENDED"}
        </span>
      )}
      <h4 className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.03em]"} text-2xl font-black text-white`}>
        {name}
      </h4>
      <p className="mt-3 min-h-12 text-sm leading-6 text-white/65">{description}</p>
      <p className="mt-6 font-mono text-2xl text-[#BBFF00]" dir="ltr" style={{ unicodeBidi: "isolate" }}>
        {offer.price} <span className="text-xs text-white/50">{priceSuffix}</span>
      </p>

      <div className="my-5 h-px bg-white/15" />
      <ul className="space-y-2 text-sm leading-6 text-white/75">
        {visibleOutputs.map((output) => (
          <li key={output} className="flex items-start gap-2">
            <Check size={15} className="mt-1 shrink-0 text-[#BBFF00]" aria-hidden="true" />
            <span>{output}</span>
          </li>
        ))}
      </ul>
      {hiddenOutputs.length > 0 && (
        <details className="mt-4 border-t border-white/10 pt-3">
          <summary className="cursor-pointer text-xs font-bold text-white/60 hover:text-white">
            {isArabic ? "شوف باقي المخرجات" : "See remaining outputs"}
          </summary>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-white/65">
            {hiddenOutputs.map((output) => (
              <li key={output} className="flex items-start gap-2">
                <Check size={15} className="mt-1 shrink-0 text-[#BBFF00]" aria-hidden="true" />
                <span>{output}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      {note && <p className="mt-5 text-xs leading-5 text-white/45">{note}</p>}
      <button
        type="button"
        onClick={() => saveSelection(route, offer.id, isStart, language)}
        data-cursor-label={isArabic ? "اختار" : "CHOOSE"}
        className={`mt-6 zoomix-button w-full ${offer.featured ? "bg-[#BBFF00] text-[#0A0A0A]" : "border-white/30 text-white"}`}
      >
        {isArabic ? "اختار المسار" : "Choose this route"}
      </button>
    </Gsap.article>
  );
}

const PackagesSection = memo(function PackagesSection() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const groups = [
    {
      id: "start",
      number: "01",
      title: isArabic ? "البداية" : "START",
      description: isArabic ? "لما تكون لسه بتبدأ أو محتاج ترتب أساس البراند." : "For a business starting out or organizing its foundation.",
      result: isArabic ? "نظام واضح تقدر تبني عليه." : "A clear system you can build on.",
      route: "start",
      lanes: [{ label: isArabic ? "باقات التأسيس" : "FOUNDATION PACKAGES", packages: ZOOMIX_PACKAGES, start: true }],
    },
    {
      id: "show",
      number: "02",
      title: isArabic ? "الظهور" : "SHOW",
      description: isArabic ? "لما البراند يكون جاهز ويحتاج مادة تخليه يظهر بشكل أقوى." : "For a ready brand that needs work that makes it show up stronger.",
      result: isArabic ? "محتوى أو تغطية جاهزة للاستخدام." : "Content or coverage ready to use.",
      route: "show",
      lanes: [
        { label: isArabic ? "باقات صناعة المحتوى" : "CONTENT PRODUCTION PACKAGES", packages: ZOOMIX_CONTENT_PACKAGES },
        { label: isArabic ? "باقات تغطية الإيفنتات" : "EVENT COVERAGE PACKAGES", packages: ZOOMIX_EVENT_PACKAGES },
      ],
    },
    {
      id: "continue",
      number: "03",
      title: isArabic ? "الاستمرار" : "CONTINUE",
      description: isArabic ? "لما تحتاج شريكًا يحافظ على الاتجاه ويطوره كل شهر." : "For a brand that needs a partner to maintain and develop the direction monthly.",
      result: isArabic ? "حضور ثابت واتجاه محتوى مستمر." : "Consistent presence and ongoing content direction.",
      route: "continue",
      lanes: [{ label: isArabic ? "باقات الشراكة الشهرية" : "MONTHLY PARTNERSHIP", packages: ZOOMIX_PARTNER_PACKAGES }],
    },
  ];
  const directServices = ZOOMIX_ONE_OFF_SERVICES[language];

  return (
    <section id="packages-section" className="zoomix-section bg-[#0A0A0A] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="mb-12 flex items-center gap-4">
          <span className="h-2 w-2 bg-[#BBFF00]" aria-hidden="true" />
          <span className="zoomix-label">03. {isArabic ? "طرق التعامل" : "WAYS TO WORK"}</span>
          <div className="h-px flex-1 bg-white/15" />
        </div>

        <div className="mb-14 grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <h2 className={`${isArabic ? "font-arabic tracking-normal" : "font-display tracking-[-0.06em]"} text-5xl font-black leading-[0.92] md:text-8xl`}>
            {isArabic ? "اختار طريقة الشغل." : "Choose your way to work with us."}
          </h2>
          <div>
            <p className="max-w-xl text-lg leading-8 text-white/70 md:text-xl">
              {isArabic
                ? "مش كل مشروع محتاج نفس الحل. اختار المسار الأقرب لمرحلتك، وإحنا نرتب التفاصيل من هناك."
                : "Every project needs a different route. Choose the one closest to your stage and we will organize the details from there."}
            </p>
            <p className="mt-4 max-w-xl border-s-2 border-[#BBFF00] ps-3 text-sm leading-6 text-white/50">
              {isArabic
                ? "نظام التنفيذ داخل كل مشروع: Build / Show / Launch. المسارات الأربعة هنا بتحدد طريقة الشراكة الأنسب ليك."
                : "Every project still follows Build / Show / Launch. These four routes simply define the right way to work together."}
            </p>
            <a href="/route-finder" className="mt-5 inline-flex text-sm font-bold text-[#BBFF00] underline decoration-[#BBFF00]/40 underline-offset-4 hover:text-white">
              {isArabic ? "لسه محتار؟ استخدم Route Finder" : "Still deciding? Use the Route Finder"}
            </a>
          </div>
        </div>

        <nav className="offer-route-map mb-16 grid gap-2 md:grid-cols-4" aria-label={isArabic ? "مسارات العمل" : "Work routes"}>
          {groups.map((group) => (
            <a key={group.id} href={`#offer-${group.id}`} className="offer-route-card group border border-white/15 p-5 transition-colors hover:border-[#BBFF00]">
              <span className="font-mono text-xs text-[#BBFF00]">{group.number}</span>
              <strong className="mt-4 block text-2xl font-black group-hover:text-[#BBFF00]">{group.title}</strong>
              <span className="mt-2 block text-sm leading-6 text-white/55">{group.description}</span>
            </a>
          ))}
          <a href="#offer-one-thing" className="offer-route-card group border border-white/15 p-5 transition-colors hover:border-[#BBFF00]">
            <span className="font-mono text-xs text-[#BBFF00]">04</span>
            <strong className="mt-4 block text-2xl font-black group-hover:text-[#BBFF00]">{isArabic ? "خدمة واحدة" : "ONE THING"}</strong>
            <span className="mt-2 block text-sm leading-6 text-white/55">{isArabic ? "حل محدد بدون باقة كاملة." : "One clear service without a full package."}</span>
          </a>
        </nav>

        <div className="space-y-20">
          {groups.map((group) => (
            <section key={group.id} id={`offer-${group.id}`} className="offer-family scroll-mt-24 border-t border-white/15 pt-8">
              <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr]">
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <span className="font-mono text-xs tracking-[0.2em] text-[#BBFF00]">{group.number} / {group.title}</span>
                  <h3 className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.04em]"} mt-5 text-4xl font-black md:text-6xl`}>{group.description}</h3>
                  <p className="mt-5 border-s-2 border-[#BBFF00] ps-4 text-sm leading-6 text-white/60">{group.result}</p>
                </div>
                <div className="space-y-10">
                  {group.lanes.map((lane) => (
                    <div key={lane.label}>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#BBFF00]" aria-hidden="true" />
                        <span className="font-mono text-[10px] tracking-[0.18em] text-white/45">{lane.label}</span>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        {lane.packages.map((offer, index) => (
                          <OfferTierCard key={offer.id} offer={offer} language={language} route={group.route} isStart={lane.start} index={index} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        <section id="offer-one-thing" className="mt-20 scroll-mt-24 border-t border-white/15 pt-8">
          <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr]">
            <div>
              <span className="font-mono text-xs tracking-[0.2em] text-[#BBFF00]">{isArabic ? "خدمة واحدة / ONE THING" : "ONE THING / SERVICE"}</span>
              <h3 className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.04em]"} mt-5 text-4xl font-black md:text-6xl`}>{isArabic ? "محتاج حاجة محددة؟" : "Need one specific thing?"}</h3>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
                {isArabic ? "اختار خدمة واحدة مباشرة بدون الدخول في باقة كاملة." : "Choose one clear service without entering a full package."}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {directServices.map((service, index) => (
                <Gsap.button
                  key={service.id}
                  type="button"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.04, ease: "easeOut" }}
                  onClick={() => saveSelection("one-off", service.id, false, language)}
                  className="direct-service-card flex min-h-20 items-center justify-between gap-3 border border-white/15 px-4 py-3 text-start transition-colors hover:border-[#BBFF00]"
                >
                  <span className="text-sm font-bold text-white/85">{service.name}</span>
                  <span className="shrink-0 font-mono text-[10px] text-[#BBFF00]" dir="ltr" style={{ unicodeBidi: "isolate" }}>{service.price}</span>
                </Gsap.button>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-16 grid gap-3 border-t border-white/15 pt-6 text-sm text-white/60 sm:grid-cols-3">
          <p><strong className="block text-white">{isArabic ? "السعر" : "PRICE"}</strong>{isArabic ? "أتعاب الباقة واضحة من البداية." : "The package fee is clear from the start."}</p>
          <p><strong className="block text-white">{isArabic ? "المشمول" : "INCLUDED"}</strong>{isArabic ? "المخرجات موضحة داخل كل اختيار." : "The deliverables are listed inside each option."}</p>
          <p><strong className="block text-white">{isArabic ? "حسب التنفيذ" : "PRODUCTION"}</strong>{isArabic ? "المعدات والتنقل والإنتاج الإضافي حسب التنفيذ." : "Equipment, transport and extra production depend on execution."}</p>
        </div>
      </div>
    </section>
  );
});

export default PackagesSection;
