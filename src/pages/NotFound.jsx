import { useEffect } from "react";
import { ArrowUpLeft, ArrowUpRight, Compass } from "lucide-react";
import Cursor from "../components/Cursor";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n";

export default function NotFound() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const ActionArrow = isArabic ? ArrowUpLeft : ArrowUpRight;

  useEffect(() => {
    document.title = isArabic ? "ZOOMIX — الصفحة مش هنا" : "ZOOMIX — Page not found";
    return () => {
      document.title = "ZOOMIX";
    };
  }, [isArabic]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <Cursor />
      <Navbar />
      <main className="mx-auto flex min-h-screen max-w-[1400px] flex-col justify-center px-6 py-32 md:px-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#BBFF00]">ZOOMIX / 404</span>
        <h1 className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.05em]"} mt-6 max-w-4xl text-6xl font-black leading-[0.9] md:text-9xl`}>
          {isArabic ? "الصفحة مش هنا." : "This page is not here."}
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-white/65 md:text-2xl">
          {isArabic ? "ضعت؟ خلينا نرتبها سوا ونوصلك للمسار الصح." : "Lost? Let us sort it out and get you on the right route."}
        </p>
        <div className="mt-12 flex flex-wrap gap-3">
          <a href="/route-finder" className="zoomix-button bg-[#BBFF00] text-black">
            <Compass size={18} aria-hidden="true" />
            {isArabic ? "ابدأ الاختيار السريع" : "Start Quick Match"}
            <ActionArrow size={18} aria-hidden="true" />
          </a>
          <a href="/" className="zoomix-button border border-white/25 text-white hover:border-[#BBFF00] hover:text-[#BBFF00]">
            {isArabic ? "العودة للموقع" : "Back to the website"}
          </a>
        </div>
      </main>
    </div>
  );
}
