import { Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import Cursor from "../components/Cursor";
import Navbar from "../components/Navbar";
import OfferPathSection from "../components/OfferPathSection";
import SectionSkeleton from "../components/SectionSkeleton";
import RouteFinderSeo from "../components/RouteFinderSeo";
import { useLanguage } from "../i18n";

export default function RouteFinder() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const ActionArrow = isArabic ? ArrowUpLeft : ArrowUpRight;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editToken = searchParams.get("edit");
  const returnTo = editToken ? `/brief/edit/${encodeURIComponent(editToken)}` : "";

  return (
    <div className="min-h-screen bg-[#F5F4EF] text-[#0A0A0A] selection:bg-[#BBFF00] selection:text-black">
      <RouteFinderSeo />
      <a className="skip-link" href="#route-finder-content">
        {isArabic ? "تخطي إلى المحتوى" : "Skip to content"}
      </a>
      <Cursor />
      <Navbar />
      <main id="route-finder-content">
        <div className="route-finder-page-intro mx-auto max-w-[1400px] px-6 pb-4 pt-32 md:px-12 md:pt-40">
          <div className="route-finder-page-kicker flex flex-col justify-between gap-8 border-b border-black/15 pb-8 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/45">ZOOMIX / {isArabic ? "خطوتك الجاية" : "NEXT MOVE"}</span>
              <h1 className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.05em]"} mt-4 max-w-4xl text-5xl font-black leading-[0.92] md:text-8xl`}>
                {isArabic ? "مش لازم تعرف تبدأ منين." : "You do not need to know where to start."}
                <span className="block text-[#789900]">{isArabic ? "خلينا نحددها سوا." : "Let us find it together."}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-black/60 md:text-lg">
                {isArabic ? "أسئلة قصيرة توصلك للمسار والخدمة أو الباقة الأقرب لمشروعك." : "A few short questions take you to the route, service or package closest to your project."}
              </p>
            </div>
            <a href="/" className="inline-flex min-h-11 shrink-0 items-center py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-black/55 transition-colors hover:text-black">
              ← {isArabic ? "ارجع للموقع" : "Back to Zoomix"}
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">
            <span><b className="text-[#789900]">01</b> {isArabic ? "حدد مكانك" : "Locate your project"}</span>
            <span><b className="text-[#789900]">02</b> {isArabic ? "سمّي الاحتياج" : "Name the need"}</span>
            <span><b className="text-[#789900]">03</b> {isArabic ? "خد خطوتك" : "Take the next move"}</span>
          </div>
          <div className="route-finder-page-cta mt-8 flex flex-wrap gap-3">
            <a href="#route-mode-chooser" className="zoomix-button bg-[#0A0A0A] text-white hover:bg-[#BBFF00] hover:text-black">
              {isArabic ? "حدد خطوتك" : "Find your next move"}
              <ActionArrow size={18} aria-hidden="true" />
            </a>
            <a href="/#packages-section" className="zoomix-button border-black/25 text-black hover:border-black hover:bg-white">
              {isArabic ? "عارف احتياجك؟ شوف الباقات" : "Know what you need? See packages"}
            </a>
          </div>
        </div>
        <Suspense fallback={<SectionSkeleton className="min-h-screen" />}>
          <OfferPathSection standalone returnTo={returnTo} />
        </Suspense>
        <section id="route-finder-contact" className="route-finder-conclusion bg-[#0A0A0A] px-6 py-24 text-white md:px-12 md:py-32" dir={isArabic ? "rtl" : "ltr"}>
          <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-10 border-t border-white/15 pt-8 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#BBFF00]">04 / {isArabic ? "الخطوة التالية" : "NEXT STEP"}</span>
              <h2 className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.05em]"} mt-5 max-w-3xl text-5xl font-black leading-[0.92] md:text-8xl`}>
                {isArabic ? "جاهز نحدد خطوتك الجاية؟" : "Ready to plan your next move?"}
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/55 md:text-lg">
              {isArabic ? "ابعت لنا تفاصيل مشروعك، وخلي الترشيح يتحول لخطة تنفيذ واضحة." : "Send us the project details and turn the route into a clear execution plan."}
            </p>
          </div>
            <a
              href={returnTo || "/#contact-section"}
              onClick={(event) => {
                event.preventDefault();
                navigate(returnTo || "/#contact-section");
              }}
              className="zoomix-button shrink-0 bg-[#BBFF00] text-black"
            >
              {returnTo ? (isArabic ? "ارجع لتفاصيل مشروعك" : "Back to your project details") : (isArabic ? "كمّل تفاصيل مشروعك" : "Continue with your project details")}
              <ActionArrow size={18} aria-hidden="true" />
            </a>
          </div>
        </section>
        <footer className="border-t border-white/10 bg-[#0A0A0A] px-6 py-8 text-white md:px-12">
          <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45 md:flex-row md:items-center">
            <span>ZOOMIX — CREATIVE PARTNER · CAIRO, EGYPT</span>
            <a href="/" className="text-[#BBFF00] transition-colors hover:text-white">{isArabic ? "العودة إلى الموقع" : "Back to the main site"}</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
