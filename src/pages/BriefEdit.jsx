import { useEffect, useMemo, useState } from "react";
import { ArrowUpLeft, ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Cursor from "../components/Cursor";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n";
import {
  ZOOMIX_CONTENT_PACKAGES,
  ZOOMIX_EVENT_PACKAGES,
  ZOOMIX_ONE_OFF_SERVICES,
  ZOOMIX_PARTNER_PACKAGES,
} from "../data/zoomixOfferings";
import { ZOOMIX_PACKAGES } from "../data/zoomixPackages";

const CONTACT_OPTIONS = [
  { value: "whatsapp", ar: "واتساب", en: "WhatsApp" },
  { value: "call", ar: "مكالمة هاتفية", en: "Phone call" },
  { value: "email", ar: "إيميل", en: "Email" },
];

const CALL_TIME_OPTIONS = [
  { value: "morning", ar: "الصبح", en: "Morning" },
  { value: "afternoon", ar: "الظهر أو العصر", en: "Afternoon" },
  { value: "evening", ar: "المساء", en: "Evening" },
  { value: "anytime", ar: "أي وقت مناسب", en: "Any suitable time" },
];

const BUDGET_OPTIONS = [
  { value: "under-5000", ar: "أقل من 5,000 جنيه", en: "Under 5,000 EGP" },
  { value: "5000-10000", ar: "من 5,000 إلى 10,000 جنيه", en: "5,000–10,000 EGP" },
  { value: "10000-15000", ar: "من 10,000 إلى 15,000 جنيه", en: "10,000–15,000 EGP" },
  { value: "over-15000", ar: "أكثر من 15,000 جنيه", en: "Over 15,000 EGP" },
  { value: "not-sure", ar: "مش متأكد وعاوز توجيه", en: "Not sure yet — I need guidance" },
];

const TIMELINE_OPTIONS = [
  { value: "within-2-weeks", ar: "خلال أسبوعين", en: "Within two weeks" },
  { value: "within-month", ar: "خلال شهر", en: "Within a month" },
  { value: "one-to-three-months", ar: "خلال شهر إلى 3 أشهر", en: "Within one to three months" },
  { value: "not-sure", ar: "لسه مش محدد", en: "Not decided yet" },
];

const SHOW_TYPE_OPTIONS = [
  { value: "content", ar: "صناعة محتوى للمشروع", en: "Content production for the project" },
  { value: "events", ar: "تغطية إيفنت", en: "Event coverage" },
];

const EVENT_TYPE_OPTIONS = [
  { value: "launch", ar: "إطلاق أو افتتاح", en: "Launch or opening" },
  { value: "conference", ar: "مؤتمر أو فعالية شركة", en: "Conference or company event" },
  { value: "experience", ar: "تجربة أو فعالية للجمهور", en: "Public experience or event" },
  { value: "other", ar: "نوع آخر", en: "Other" },
];

const EVENT_COVERAGE_OPTIONS = [
  { value: "essentials", ar: "الأساسيات واللحظات الرئيسية", en: "Essentials and key moments" },
  { value: "story", ar: "قصة أوضح بعد الحدث", en: "A clearer story after the event" },
  { value: "parallel", ar: "تغطية متزامنة صور وفيديو", en: "Parallel photo and video coverage" },
];

const ROUTE_LABELS = {
  start: { ar: "البداية", en: "Start" },
  show: { ar: "الظهور", en: "Show" },
  continue: { ar: "الاستمرار", en: "Continue" },
  "one-thing": { ar: "خدمة واحدة", en: "One thing" },
};

function normalizeRoute(route) {
  if (route === "content" || route === "events") return "show";
  if (route === "partner") return "continue";
  if (route === "one-off") return "one-thing";
  return route || "";
}

function serviceForRoute(route, showType) {
  const normalized = normalizeRoute(route);
  if (normalized === "start") return "identity";
  if (normalized === "show" && showType === "events") return "event-highlight";
  if (normalized === "show") return "content-production";
  if (normalized === "continue") return "monthly-partnership";
  return "not-sure";
}

function offerNameFor(id, language) {
  if (!id) return "";
  const groups = [
    ...ZOOMIX_PACKAGES,
    ...ZOOMIX_CONTENT_PACKAGES,
    ...ZOOMIX_EVENT_PACKAGES,
    ...ZOOMIX_PARTNER_PACKAGES,
  ];
  const offer = groups.find((item) => item.id === id);
  if (offer) return offer.name?.[language] || offer.name || id;
  return ZOOMIX_ONE_OFF_SERVICES[language]?.find((item) => item.id === id)?.name || id;
}

function valueLabel(options, value, language) {
  return options.find((option) => option.value === value)?.[language] || value || "—";
}

export default function BriefEdit() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const label = (ar, en) => (isArabic ? ar : en);
  const ActionArrow = isArabic ? ArrowUpLeft : ArrowUpRight;

  const applyRouteFromQuery = (brief) => {
    const params = new URLSearchParams(location.search);
    const nextRoute = params.get("route");
    const nextOfferId = params.get("offerId");
    if (!nextRoute && !nextOfferId) return brief;
    const nextShowType =
      nextRoute === "events"
        ? "events"
        : nextRoute === "content"
          ? "content"
          : nextRoute
            ? ""
            : brief.showType;
    const normalizedRoute = normalizeRoute(nextRoute || brief.route);
    return {
      ...brief,
      route: normalizedRoute,
      offerId: nextOfferId || brief.offerId,
      offerName: nextOfferId ? offerNameFor(nextOfferId, language) : brief.offerName,
      showType: nextShowType,
      service: nextRoute ? serviceForRoute(normalizedRoute, nextShowType) : brief.service,
    };
  };

  useEffect(() => {
    let cancelled = false;
    async function loadBrief() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/briefs/edit/${token}`, { cache: "no-store" });
        const result = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(
            result.error ||
              label(
                "الرابط غير صالح أو انتهت صلاحيته.",
                "This edit link is invalid or has expired.",
              ),
          );
        if (!cancelled) setForm(applyRouteFromQuery(result.brief));
      } catch (loadError) {
        if (!cancelled)
          setError(loadError.message || label("تعذر تحميل البريف.", "Could not load the brief."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token) loadBrief();
    return () => {
      cancelled = true;
    };
  }, [token, language]);

  useEffect(() => {
    if (!form || (!location.search.includes("route=") && !location.search.includes("offerId=")))
      return;
    navigate(`/brief/edit/${token}`, { replace: true });
  }, [form, location.search, navigate, token]);

  const update = (key, value) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const routeLabel = useMemo(
    () => ROUTE_LABELS[normalizeRoute(form?.route)]?.[language] || label("البريف", "Project brief"),
    [form?.route, language],
  );

  const isEventBrief =
    form?.showType === "events" ||
    (normalizeRoute(form?.route) === "show" && Boolean(form?.eventDate));
  const inputClass =
    "min-w-0 w-full border border-black/20 bg-white px-4 py-3.5 outline-hidden transition-colors focus:border-[#6b8d00] focus:ring-2 focus:ring-[#BBFF00]/35";

  const field = (key, fieldLabel, type = "text") => (
    <label className="block">
      <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.08em] text-black/70">
        {fieldLabel}
      </span>
      <input
        type={type}
        value={form?.[key] || ""}
        onChange={(event) => update(key, event.target.value)}
        className={inputClass}
      />
    </label>
  );

  const selectField = (key, fieldLabel, options) => (
    <label className="block">
      <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.08em] text-black/70">
        {fieldLabel}
      </span>
      <select
        value={form?.[key] || ""}
        onChange={(event) => update(key, event.target.value)}
        className={inputClass}
      >
        <option value="">{label("اختار من القائمة", "Choose from the list")}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option[language]}
          </option>
        ))}
      </select>
    </label>
  );

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(`/api/briefs/edit/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, goal: form.description, consent: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || label("تعذر حفظ التعديل.", "Could not save the update."));
      setForm(result.brief);
      setSaved(true);
    } catch (saveError) {
      setError(saveError.message || label("تعذر حفظ التعديل.", "Could not save the update."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#BBFF00] selection:text-black"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Cursor />
      <Navbar />
      <main className="mx-auto grid max-w-[1400px] gap-12 px-6 pb-24 pt-32 md:px-12 md:pt-40 lg:grid-cols-[0.75fr_1.25fr]">
        <section className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#BBFF00]">
            ZOOMIX / EDIT BRIEF
          </p>
          <h1
            className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.05em]"} mt-6 text-5xl font-black leading-[0.92] md:text-7xl`}
          >
            {label("لسه في خطوة؟", "ONE MORE MOVE?")}
            <span className="block text-[#BBFF00]">{label("عدّل البريف.", "EDIT THE BRIEF.")}</span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-8 text-white/60">
            {label(
              "عدّل التفاصيل اللي محتاجة توضيح، وإحنا نكمل من نفس الطلب من غير ما تبدأ من جديد.",
              "Update whatever needs clarity. We will continue from the same request, without starting over.",
            )}
          </p>
          <div className="mt-10 border-t border-white/15 pt-5 text-sm text-white/45">
            <p>{label("رقم الطلب", "Reference")}</p>
            <p className="mt-2 font-mono text-[#BBFF00]">{form?.referenceCode || "—"}</p>
          </div>
          <a
            href="https://wa.me/201555451535"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-3 text-[#BBFF00]"
          >
            <MessageCircle size={19} /> <span dir="ltr">+20 15 5545 1535</span>
          </a>
        </section>

        <section className="min-w-0 border border-white/10 bg-[#F5F4EF] text-[#0A0A0A] shadow-[0_16px_60px_rgba(0,0,0,0.22)]">
          <div className="h-1 bg-[#BBFF00]" />
          <div className="border-b border-black/15 bg-white px-5 py-6 md:px-10">
            <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-black/45">
              ZOOMIX / PROJECT BRIEF
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-black">{label("تعديل التفاصيل", "EDIT THE DETAILS")}</h2>
              {form?.updatedAt && (
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                  {label("آخر تعديل محفوظ", "LAST SAVED")}
                </span>
              )}
            </div>
          </div>

          {loading && (
            <div className="px-5 py-16 text-center text-black/50 md:px-10">
              {label("بنحمّل البريف…", "Loading your brief…")}
            </div>
          )}
          {!loading && error && (
            <div className="px-5 py-16 md:px-10">
              <div className="border border-red-300 bg-red-50 p-5 text-red-800" role="alert">
                {error}
              </div>
              <a href="/" className="mt-6 inline-flex font-bold underline underline-offset-4">
                {label("ارجع للموقع", "Back to Zoomix")}
              </a>
            </div>
          )}
          {!loading && !error && form && (
            <form onSubmit={save} className="grid gap-6 p-5 md:grid-cols-2 md:p-10">
              <div className="md:col-span-2 border border-[#6b8d00] bg-[#BBFF00]/15 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#5e7c00]">
                      ZOOMIX / NEXT MOVE
                    </p>
                    <p className="mt-2 text-xl font-black">{form.offerName || routeLabel}</p>
                    <p className="mt-1 text-sm text-black/55">
                      {label("المسار الحالي", "Current route")}: {routeLabel}
                    </p>
                  </div>
                  <a
                    href={`/route-finder?edit=${encodeURIComponent(token)}`}
                    className="shrink-0 font-bold underline decoration-black/30 underline-offset-4"
                  >
                    {label("تغيير المسار", "Change route")} ↗
                  </a>
                </div>
              </div>

              {field("name", label("الاسم", "Name"))}
              {field("project", label("اسم المشروع", "Project name"))}
              {field("activity", label("نوع النشاط", "Business type"))}
              {field(
                "projectLink",
                label("عندك حاجة نراجعها؟ (اختياري)", "Anything we should review? (optional)"),
                "url",
              )}
              {selectField(
                "budget",
                label("الميزانية التقريبية", "Approx. budget"),
                BUDGET_OPTIONS,
              )}
              {selectField(
                "launchDate",
                label("التوقيت المطلوب", "When do you want to start?"),
                TIMELINE_OPTIONS,
              )}

              {form.route === "show" &&
                selectField("showType", label("نوع الطلب", "Request type"), SHOW_TYPE_OPTIONS)}
              {isEventBrief && (
                <>
                  {selectField("eventType", label("نوع الإيفنت", "Event type"), EVENT_TYPE_OPTIONS)}
                  {field("eventDate", label("تاريخ الإيفنت", "Event date"), "date")}
                  {field("eventLocation", label("مكان الإيفنت", "Event location"))}
                  {selectField(
                    "coverageType",
                    label("شكل التغطية", "Coverage style"),
                    EVENT_COVERAGE_OPTIONS,
                  )}
                </>
              )}

              <label className="block md:col-span-2">
                <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.08em] text-black/70">
                  {label(
                    "إيه اللي عاوز توصله؟ واحكيلنا عنه باختصار",
                    "What should this move achieve?",
                  )}
                </span>
                <textarea
                  value={form.description || ""}
                  onChange={(event) => update("description", event.target.value)}
                  rows="7"
                  maxLength="1200"
                  className={`${inputClass} min-h-40 resize-y`}
                />
              </label>

              <div className="md:col-span-2 border-t border-black/15 pt-6">
                <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-black/45">
                  CONTACT LINE / {label("وسيلة التواصل", "CONTACT METHOD")}
                </p>
              </div>
              <div className="md:col-span-2">
                {selectField(
                  "contactPreference",
                  label("تحب نكمل معاك إزاي؟", "How should we reach you?"),
                  CONTACT_OPTIONS,
                )}
              </div>
              {form.contactPreference !== "email" &&
                field("phone", label("رقم الهاتف", "Phone"), "tel")}
              {form.contactPreference === "email" &&
                field("email", label("الإيميل", "Email"), "email")}
              {form.contactPreference === "call" &&
                selectField(
                  "preferredTime",
                  label("الوقت المفضل للمكالمة", "Preferred call time"),
                  CALL_TIME_OPTIONS,
                )}

              {error && (
                <div
                  className="md:col-span-2 border border-red-300 bg-red-50 p-4 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              )}
              {saved && (
                <div
                  className="md:col-span-2 flex items-center gap-2 border border-[#6b8d00]/30 bg-[#BBFF00]/10 p-4 text-sm text-[#4d6900]"
                  role="status"
                >
                  <Check size={16} />{" "}
                  {label(
                    "اتحفظ التعديل على نفس البريف.",
                    "Your update was saved to the same brief.",
                  )}
                </div>
              )}
              <div className="md:col-span-2 flex flex-col justify-between gap-4 border-t border-black/15 pt-6 sm:flex-row sm:items-center">
                <a href="/" className="font-bold text-black/60 underline underline-offset-4">
                  {label("ارجع للموقع", "Back to Zoomix")}
                </a>
                <button
                  type="submit"
                  disabled={saving}
                  className="zoomix-button bg-[#BBFF00] text-[#0A0A0A] disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? label("بيتحفظ…", "Saving…") : label("حفظ التعديل", "Save update")}{" "}
                  <ActionArrow size={18} />
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
