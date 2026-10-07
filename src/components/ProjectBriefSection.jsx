import { useEffect, useMemo, useState, memo, useRef } from "react";
import { ArrowUpLeft, ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { useLanguage } from "../i18n";
import { trackEvent } from "../utils/analytics";
import { ZOOMIX_PACKAGES } from "../data/zoomixPackages";
import {
  ZOOMIX_CONTENT_PACKAGES,
  ZOOMIX_EVENT_PACKAGES,
  ZOOMIX_PARTNER_PACKAGES,
  ZOOMIX_ONE_OFF_SERVICES,
} from "../data/zoomixOfferings";

const initialForm = {
  name: "",
  project: "",
  phone: "",
  activity: "",
  service: "",
  packageId: "",
  route: "",
  offerId: "",
  showType: "",
  contentSource: "",
  eventType: "",
  eventDate: "",
  eventLocation: "",
  coverageType: "",
  budget: "",
  launchDate: "",
  projectLink: "",
  goal: "",
  description: "",
  email: "",
  contactPreference: "",
  preferredTime: "",
  website: "",
  consent: false,
};

const ROUTE_SERVICE_OPTIONS = {
  start: [
    { value: "identity", ar: "هوية واتجاه بصري", en: "Identity and visual direction" },
    { value: "presence", ar: "تجهيز الحضور الرقمي", en: "Digital presence setup" },
    { value: "launch", ar: "تجهيز كامل للبداية", en: "Complete launch setup" },
    { value: "not-sure", ar: "مش متأكد وعاوز توجيه", en: "Not sure yet — I need guidance" },
  ],
  showContent: [
    { value: "content-production", ar: "صناعة محتوى", en: "Content production" },
    { value: "content-editing", ar: "مونتاج من خاماتي", en: "Editing from my footage" },
    { value: "content-campaign", ar: "حملة أو إطلاق", en: "Campaign or launch" },
    { value: "not-sure", ar: "مش متأكد وعاوز توجيه", en: "Not sure yet — I need guidance" },
  ],
  showEvents: [
    { value: "event-photos", ar: "تصوير صور", en: "Event photography" },
    { value: "event-highlight", ar: "صور وفيديو Highlight", en: "Photos and highlight video" },
    { value: "event-full-coverage", ar: "تغطية متزامنة كاملة", en: "Full simultaneous coverage" },
    { value: "not-sure", ar: "مش متأكد وعاوز توجيه", en: "Not sure yet — I need guidance" },
  ],
  continue: [
    { value: "monthly-content", ar: "محتوى شهري", en: "Monthly content" },
    { value: "monthly-partnership", ar: "شراكة إبداعية شهرية", en: "Monthly creative partnership" },
    { value: "brand-development", ar: "تطوير حضور البراند", en: "Brand presence development" },
    { value: "not-sure", ar: "مش متأكد وعاوز توجيه", en: "Not sure yet — I need guidance" },
  ],
  oneThing: [
    { value: "identity", ar: "هوية أو اتجاه بصري", en: "Identity or visual direction" },
    { value: "digital", ar: "حضور رقمي أو Landing Page", en: "Digital presence or Landing Page" },
    { value: "content", ar: "محتوى أو مونتاج", en: "Content or editing" },
    { value: "print", ar: "مطبوعات", en: "Print" },
    { value: "not-sure", ar: "مش متأكد وعاوز توجيه", en: "Not sure yet — I need guidance" },
  ],
  default: [{ value: "not-sure", ar: "مش متأكد وعاوز توجيه", en: "Not sure yet — I need guidance" }],
};

const SHOW_TYPE_OPTIONS = [
  { value: "content", ar: "صناعة محتوى للمشروع", en: "Content production for the project" },
  { value: "events", ar: "تغطية إيفنت", en: "Event coverage" },
];

const CONTENT_SOURCE_OPTIONS = [
  { value: "client-footage", ar: "من خامات عندي", en: "From footage I already have" },
  { value: "new-shoot", ar: "محتاج تصوير جديد", en: "I need a new shoot" },
  { value: "not-sure", ar: "مش متأكد وعاوز توجيه", en: "Not sure yet — I need guidance" },
];

const EVENT_COVERAGE_OPTIONS = [
  { value: "essentials", ar: "الأساسيات واللحظات الرئيسية", en: "Essentials and key moments" },
  { value: "story", ar: "قصة أوضح بعد الحدث", en: "A clearer story after the event" },
  { value: "parallel", ar: "تغطية متزامنة صور وفيديو", en: "Parallel photo and video coverage" },
];

const EVENT_TYPE_OPTIONS = [
  { value: "launch", ar: "إطلاق أو افتتاح", en: "Launch or opening" },
  { value: "conference", ar: "مؤتمر أو فعالية شركة", en: "Conference or company event" },
  { value: "experience", ar: "تجربة أو فعالية للجمهور", en: "Public experience or event" },
  { value: "other", ar: "نوع آخر", en: "Other" },
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

function inferShowType(offerId = "") {
  if (offerId.startsWith("event-")) return "events";
  if (offerId.startsWith("content-")) return "content";
  return "";
}

function inferService(route, showType) {
  if (route === "start") return "identity";
  if (route === "show" && showType === "events") return "event-highlight";
  if (route === "show") return "content-production";
  if (route === "continue") return "monthly-partnership";
  return "not-sure";
}

const ProjectBriefSection = memo(function ProjectBriefSection() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [whatsappBlocked, setWhatsappBlocked] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [submitError, setSubmitError] = useState("");
  const sectionRef = useRef(null);
  const briefStartedRef = useRef(false);

  useEffect(() => {
    const applyPackage = (id) => {
      setForm((current) => ({
        ...current,
        packageId: id || current.packageId,
        offerId: id || current.offerId,
        route: id ? "start" : current.route,
        showType: id ? "" : current.showType,
        service: id ? "" : current.service,
      }));
    };
    const normalizeRoute = (route) => {
      if (route === "content" || route === "events") return "show";
      if (route === "partner") return "continue";
      if (route === "one-off") return "one-thing";
      return route || "";
    };
    const applyRoute = (selection) => {
      if (!selection) return;
      const route = normalizeRoute(selection.route);
      const isStartRoute = route === "start";
      setForm((current) => ({
        ...current,
        route,
        packageId: isStartRoute ? selection.packageId || current.packageId : "",
        offerId: selection.packageId || "",
        showType: route === "show" ? inferShowType(selection.packageId) || current.showType : "",
        service: "",
      }));
    };
    applyPackage(window.localStorage.getItem("zoomix-selected-package"));
    try {
      applyRoute(JSON.parse(window.localStorage.getItem("zoomix-project-route") || "null"));
    } catch {
      // Ignore malformed local selection and keep the form empty.
    }
    const onPackageSelect = (event) => applyPackage(event.detail);
    const onRouteSelect = (event) => applyRoute(event.detail);
    window.addEventListener("zoomix:package-select", onPackageSelect);
    window.addEventListener("zoomix:route-select", onRouteSelect);
    return () => {
      window.removeEventListener("zoomix:package-select", onPackageSelect);
      window.removeEventListener("zoomix:route-select", onRouteSelect);
    };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        trackEvent("reach_project_brief", { source_section: "project_brief" });
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const label = (ar, en) => (isArabic ? ar : en);
  const selectedPackage = useMemo(
    () => ZOOMIX_PACKAGES.find((pkg) => pkg.id === form.packageId),
    [form.packageId],
  );
  const selectedOfferName = useMemo(() => {
    if (!form.offerId) return selectedPackage?.name[language] || "";
    const packageGroups = [
      ...ZOOMIX_CONTENT_PACKAGES,
      ...ZOOMIX_EVENT_PACKAGES,
      ...ZOOMIX_PARTNER_PACKAGES,
    ];
    const offer = packageGroups.find((pkg) => pkg.id === form.offerId);
    if (offer) return offer.name[language];
    return ZOOMIX_ONE_OFF_SERVICES[language].find((service) => service.id === form.offerId)?.name || selectedPackage?.name[language] || "";
  }, [form.offerId, language, selectedPackage]);
  const selectedOfferId = form.offerId || form.packageId;
  const guidedSelection = Boolean(selectedOfferId || form.route);
  const activeShowType = form.showType || inferShowType(form.offerId);
  const serviceOptions =
    form.route === "start"
      ? ROUTE_SERVICE_OPTIONS.start
      : form.route === "show" && activeShowType === "events"
        ? ROUTE_SERVICE_OPTIONS.showEvents
        : form.route === "show"
          ? ROUTE_SERVICE_OPTIONS.showContent
          : form.route === "continue"
            ? ROUTE_SERVICE_OPTIONS.continue
            : form.route === "one-thing"
              ? ROUTE_SERVICE_OPTIONS.oneThing
              : ROUTE_SERVICE_OPTIONS.default;
  const isEventBrief = form.route === "show" && activeShowType === "events";
  const isContentBrief = form.route === "show" && activeShowType === "content";
  const optionLabel = (options, value) => options.find((option) => option.value === value)?.[language] || "";
  const briefStep = form.description || form.projectLink || form.goal ? 2 : 1;
  const briefProgressWidth = briefStep === 1 ? "w-1/2" : "w-full";
  const briefSteps = [
    { number: "01", ar: "الاختيار", en: "CHOICE" },
    { number: "02", ar: "التفاصيل", en: "DETAILS" },
  ];
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateField = (key, value) => {
    update(key, value);
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };
  const ActionArrow = isArabic ? ArrowUpLeft : ArrowUpRight;
  const pathLabel = {
    start: label("البداية", "Start"),
    show: label("الظهور", "Show"),
    continue: label("الاستمرار", "Continue"),
    "one-thing": label("خدمة واحدة", "One thing — one specific service"),
  };

  const buildMessage = (reference = referenceCode) => {
    const lines = [
      [label("الاسم", "Name"), form.name],
      [label("اسم المشروع", "Project"), form.project],
      [label("رقم الهاتف", "Phone"), form.phone],
      [label("نوع النشاط", "Activity"), form.activity],
      [label("نوع الخدمة", "Service"), selectedOfferName || optionLabel(serviceOptions, form.service) || pathLabel[form.route]],
      [label("المسار", "Path"), pathLabel[form.route]],
      [label("الاختيار", "Selected offer"), selectedOfferName],
      [label("نوع الطلب", "Request type"), optionLabel(SHOW_TYPE_OPTIONS, activeShowType)],
      [label("مصدر الخامات", "Content source"), optionLabel(CONTENT_SOURCE_OPTIONS, form.contentSource)],
      [label("نوع الإيفنت", "Event type"), optionLabel(EVENT_TYPE_OPTIONS, form.eventType)],
      [label("تاريخ الإيفنت", "Event date"), form.eventDate],
      [label("مكان الإيفنت", "Event location"), form.eventLocation],
      [label("نوع التغطية", "Coverage type"), optionLabel(EVENT_COVERAGE_OPTIONS, form.coverageType)],
      [label("الميزانية التقريبية", "Approx. budget"), optionLabel(BUDGET_OPTIONS, form.budget)],
      [label("التوقيت المطلوب", "Timeline"), optionLabel(TIMELINE_OPTIONS, form.launchDate)],
      [label("رابط المشروع", "Project link"), form.projectLink],
      [label("الهدف الأساسي", "Main goal"), form.goal],
      [label("وسيلة التواصل", "Preferred contact"), optionLabel(CONTACT_OPTIONS, form.contactPreference)],
      [label("الإيميل", "Email"), form.email],
      [label("الوقت المفضل للمكالمة", "Preferred call time"), optionLabel(CALL_TIME_OPTIONS, form.preferredTime)],
      [label("رقم الطلب", "Reference"), reference],
      [label("الوصف", "Description"), form.description],
    ].filter(([, value]) => String(value ?? "").trim());

    return ["ZOOMIX PROJECT BRIEF", ...lines.map(([key, value]) => `${key}: ${value}`)].join("\n");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const required = ["name", "description", "contactPreference"];
    const resolvedService = form.service || inferService(form.route, activeShowType);
    const nextErrors = Object.fromEntries(
      required.filter((key) => !form[key].trim()).map((key) => [key, label("مطلوب", "Required")]),
    );
    if (["whatsapp", "call"].includes(form.contactPreference) && !form.phone.trim()) {
      nextErrors.phone = label("رقم الهاتف مطلوب", "Phone is required");
    }
    if (form.contactPreference === "email" && !form.email.trim()) {
      nextErrors.email = label("الإيميل مطلوب", "Email is required");
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = label("اكتب إيميل صحيح", "Enter a valid email");
    }
    if (form.route === "show" && !activeShowType) {
      nextErrors.showType = label("اختار نوع الطلب", "Choose the request type");
    }
    if (isEventBrief && !form.eventDate.trim()) {
      nextErrors.eventDate = label("مطلوب لتحديد التغطية", "Required for event planning");
    }
    if (!form.consent) {
      nextErrors.consent = label("مطلوب للموافقة قبل الإرسال", "Consent is required before sending");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      trackEvent("validation_error", { field_name: Object.keys(nextErrors)[0] || "unknown" });
      setSubmitted(false);
      return;
    }
    setSubmitError("");
    setWhatsappBlocked(false);
    setMessageCopied(false);
    try {
      const response = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, service: resolvedService, offerName: selectedOfferName }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || label("حصلت مشكلة أثناء حفظ الطلب.", "We could not save the brief."));
      setReferenceCode(result.referenceCode || "");
      setSubmitted(true);
      trackEvent("brief_submitted", { route: form.route || "unknown", package_id: form.offerId || form.packageId || "none" });
      if (form.contactPreference === "whatsapp") {
        trackEvent("send_to_whatsapp", { route: form.route || "unknown", package_id: form.offerId || form.packageId || "none" });
        const whatsappWindow = window.open(
          `https://wa.me/201555451535?text=${encodeURIComponent(buildMessage(result.referenceCode))}`,
          "_blank",
          "noopener,noreferrer",
        );
        setWhatsappBlocked(!whatsappWindow);
      }
    } catch (error) {
      setSubmitted(false);
      setSubmitError(error.message || label("حصلت مشكلة أثناء الإرسال.", "Something went wrong while sending."));
    }
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(buildMessage());
      setMessageCopied(true);
    } catch {
      setMessageCopied(false);
    }
  };

  const handleBriefFocus = () => {
    if (briefStartedRef.current) return;
    briefStartedRef.current = true;
    trackEvent("start_brief", { source_section: "project_brief" });
  };

  const field = (key, labelText, type = "text", required = false) => (
    <label className="block">
      <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.08em] text-black/75">
        {labelText}
      </span>
      <input
        id={`brief-${key}`}
        type={type}
        value={form[key]}
        onChange={(event) => updateField(key, event.target.value)}
        className={`min-w-0 w-full border bg-white px-4 py-3.5 outline-none transition-colors focus:border-[#6b8d00] focus:ring-2 focus:ring-[#BBFF00]/35 ${errors[key] ? "border-red-500" : "border-black/25"}`}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `brief-${key}-error` : undefined}
        required={required}
        maxLength={key === "phone" ? 30 : 160}
        inputMode={key === "phone" ? "tel" : undefined}
        autoComplete={key === "name" ? "name" : key === "phone" ? "tel" : "off"}
      />
      {errors[key] && (
        <span id={`brief-${key}-error`} className="block mt-1 text-xs text-red-600">
          {errors[key]}
        </span>
      )}
    </label>
  );

  const selectField = (key, labelText, options, required = false, placeholder = label("اختار من القائمة", "Choose an option")) => (
    <label className="block">
      <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.08em] text-black/75">
        {labelText}
      </span>
      <select
        id={`brief-${key}`}
        value={form[key]}
        onChange={(event) => updateField(key, event.target.value)}
        className={`min-w-0 w-full border bg-white px-4 py-3.5 outline-none transition-colors focus:border-[#6b8d00] focus:ring-2 focus:ring-[#BBFF00]/35 ${errors[key] ? "border-red-500" : "border-black/25"}`}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `brief-${key}-error` : undefined}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option[language]}
          </option>
        ))}
      </select>
      {errors[key] && (
        <span id={`brief-${key}-error`} className="block mt-1 text-xs text-red-600">
          {errors[key]}
        </span>
      )}
    </label>
  );

  return (
    <section
      ref={sectionRef}
      id="contact-section"
      className="zoomix-section relative overflow-hidden bg-[#0A0A0A] text-white"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="contact-orbit" aria-hidden="true" />
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex items-center gap-4 mb-12">
          <span className="w-2 h-2 bg-[#BBFF00]" />
          <span className="zoomix-label">05. {label("نبدأ من هنا", "PROJECT BRIEF")}</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>
        <div className="grid lg:grid-cols-[0.75fr_1.25fr] gap-12 items-start">
          <div className="lg:sticky lg:top-24">
            <div className="mb-7 flex items-center justify-between border-b border-white/15 pb-4 font-mono text-[11px] tracking-[0.18em] text-white/45">
              <span>{label("نرتب الخطوة الجاية", "FIND THE NEXT MOVE")}</span>
              <span className="text-[#BBFF00]">{String(briefStep).padStart(2, "0")} / 02</span>
            </div>
            <h2
              className={`${isArabic ? "font-arabic tracking-normal" : "font-display tracking-[-0.06em]"} text-5xl md:text-7xl font-black leading-[0.92]`}
            >
              {label("نرتب الخطوة", "FIND THE NEXT")}
              <br />
              <span className="text-[#BBFF00]">{label("الجاية.", "MOVE.")}</span>
            </h2>
            <p className="mt-8 text-white/60 leading-7">
              {guidedSelection
                ? label("اختيارك اتنقل خلاص. فاضل نعرف الأساسيات بس.", "Your direction is already set. We only need the essentials now.")
                : label("مش محتاج تجهز كل الإجابات. إحنا نرتب الصورة معاك.", "You do not need every answer. We will organize the picture with you.")}
            </p>
            <p className="mt-4 text-[#BBFF00] leading-7">
              {label(
                "اكتب لنا عن مشروعك، وإحنا نرتب الخطوة التالية.",
                "Tell us about the project and we will organize the next move.",
              )}
            </p>
            <div className="relative mt-10 max-w-sm border-t border-white/15 pt-6">
              <div className="absolute inset-x-0 top-0 h-px bg-[#BBFF00] transition-all duration-500" style={{ width: `${briefStep * 33.333}%` }} />
              <div className="grid grid-cols-3 gap-3">
                {briefSteps.map((step, index) => {
                  const isActive = briefStep >= index + 1;
                  return (
                    <div key={step.number} className={`transition-colors duration-300 ${isActive ? "text-white" : "text-white/30"}`}>
                      <span className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[11px] ${isActive ? "border-[#BBFF00] bg-[#BBFF00] text-[#0A0A0A]" : "border-white/20"}`}>
                        {step.number}
                      </span>
                      <span className="block font-mono text-[10px] tracking-[0.12em]">{label(step.ar, step.en)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <a
              href="https://wa.me/201555451535"
              className="mt-8 inline-flex items-center gap-3 text-[#BBFF00] font-bold"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={20} />
              <span dir="ltr" className="[unicode-bidi:isolate]">
                +20 15 5545 1535
              </span>
            </a>
          </div>
          <form
            onSubmit={handleSubmit}
            onFocusCapture={handleBriefFocus}
            noValidate
            className="relative grid min-w-0 gap-5 overflow-hidden border border-white/10 bg-[#F5F4EF] p-5 text-[#0A0A0A] shadow-[0_16px_60px_rgba(0,0,0,0.22)] sm:grid-cols-2 md:p-10"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#BBFF00]" />
            <div className="sm:col-span-2 -mx-5 -mt-5 border-b border-black/15 bg-white px-5 pb-5 pt-6 md:-mx-10 md:-mt-10 md:px-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-black/45">ZOOMIX / PROJECT BRIEF</p>
                  <p className="mt-2 text-xl font-black tracking-[-0.03em]">{label("خلّي الخطوة واضحة.", "MAKE THE NEXT MOVE CLEAR.")}</p>
                </div>
                <span className="font-mono text-xs font-bold tracking-[0.16em] text-black/50">
                  {String(briefStep).padStart(2, "0")} / 02
                </span>
              </div>
              <div className="mt-5 h-1 bg-black/10">
                <div className={`h-full bg-[#BBFF00] transition-all duration-500 ${briefProgressWidth}`} />
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.1em] text-black/45">
                <span>{label("الاختيار", "CHOICE")}</span>
                <span>{label("التفاصيل", "DETAILS")}</span>
              </div>
            </div>
            {Object.keys(errors).length > 0 && (
              <div
                className="sm:col-span-2 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {label(
                  "راجع الحقول المطلوبة قبل الإرسال.",
                  "Please complete the required fields before sending.",
                )}
              </div>
            )}
            {field("name", label("الاسم *", "Name *"), "text", true)}
            {field("project", label("اسم المشروع", "Project name"))}
            {field("phone", label("رقم الهاتف", "Phone"), "tel")}
            {field("activity", label("نوع النشاط", "Business type"))}
            <div className="sm:col-span-2 mt-2 border-t border-black/15 pt-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-black/45">01 / {label("الاختيار", "THE CHOICE")}</p>
                  <p className="mt-2 text-sm text-black/55">{label("اختيارك من خطوتك الجاية يدخل هنا تلقائيًا.", "Your next-move choice comes through here automatically.")}</p>
                </div>
                {form.route && <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-[#5e7c00]">{pathLabel[form.route]}</span>}
              </div>
              {guidedSelection ? (
                <div className="mt-5 border border-[#6b8d00] bg-[#BBFF00]/15 p-4 shadow-[4px_4px_0_#0A0A0A]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#5e7c00]">ZOOMIX / NEXT MOVE</p>
                      <p className="mt-2 text-xl font-black leading-tight">{selectedOfferName || pathLabel[form.route]}</p>
                      <p className="mt-2 text-xs leading-5 text-black/60">
                        {label("الاختيار اتنقل تلقائيًا — مش محتاج تختاره تاني.", "This choice was carried over automatically — no need to choose it again.")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        window.localStorage.removeItem("zoomix-selected-package");
                        window.localStorage.removeItem("zoomix-project-route");
                        window.location.assign("/route-finder");
                      }}
                      className="shrink-0 text-xs font-bold underline decoration-black/30 underline-offset-4 transition-colors hover:text-[#5e7c00]"
                    >
                      {label("تغيير الاختيار", "Change selection")}
                    </button>
                  </div>
                </div>
              ) : (
                <a href="/route-finder" className="mt-5 flex items-center justify-between border border-black/20 bg-white p-4 font-bold transition-colors hover:border-[#6b8d00] hover:bg-[#BBFF00]/15">
                  <span>{label("ساعدني أختار المسار المناسب", "Help me choose the right route")}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
            {form.route === "show" && selectField("showType", label("نوع الطلب *", "Request type *"), SHOW_TYPE_OPTIONS, true, label("اختار نوع الطلب", "Choose a request type"))}
            {isContentBrief && selectField("contentSource", label("الخامات الموجودة", "Available footage"), CONTENT_SOURCE_OPTIONS)}
            {isEventBrief && (
              <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2">
                {selectField("eventType", label("نوع الإيفنت", "Event type"), EVENT_TYPE_OPTIONS)}
                {field("eventDate", label("تاريخ الإيفنت *", "Event date *"), "date", true)}
                {field("eventLocation", label("مكان الإيفنت", "Event location"))}
                {selectField("coverageType", label("شكل التغطية", "Coverage style"), EVENT_COVERAGE_OPTIONS)}
              </div>
            )}
            <div className="sm:col-span-2 mt-2 border-t border-black/15 pt-5">
              <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-black/45">02 / {label("تفاصيل المشروع", "PROJECT DETAILS")}</p>
              <p className="mt-2 text-sm text-black/55">{label("قول لنا الأساسيات، وإحنا نرتب باقي التفاصيل معاك.", "Share the essentials and we will organize the rest with you.")}</p>
            </div>
            {selectField("budget", label("الميزانية التقريبية", "Approx. budget"), BUDGET_OPTIONS)}
            {selectField("launchDate", label("التوقيت المطلوب", "When do you want to start?"), TIMELINE_OPTIONS)}
            {field("projectLink", label("رابط المشروع أو الملفات (اختياري)", "Project or files link (optional)"), "url")}
            {field("goal", label("الهدف الأساسي", "Main goal"))}
            <label className="block sm:col-span-2">
              <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.08em] text-black/75">
                {label("وصف مختصر *", "Short description *")}
              </span>
              <textarea
                id="brief-description"
                rows="5"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className={`min-h-36 min-w-0 w-full resize-y border bg-white px-4 py-3.5 outline-none transition-colors focus:border-[#6b8d00] focus:ring-2 focus:ring-[#BBFF00]/35 ${errors.description ? "border-red-500" : "border-black/25"}`}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? "brief-description-error" : undefined}
                required
                maxLength={1200}
              />
              {errors.description && (
                <span id="brief-description-error" className="block mt-1 text-xs text-red-600">
                  {errors.description}
                </span>
              )}
            </label>
            <div className="sm:col-span-2 border-t border-black/15 pt-5">
              <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-black/45">CONTACT LINE / {label("وسيلة التواصل", "YOUR CONTACT LINE")}</p>
              <p className="mt-2 text-sm text-black/55">{label("لو واتساب مش مناسب، اختار الطريقة اللي تريحك.", "WhatsApp is not required — choose the way that works for you.")}</p>
            </div>
            {selectField("contactPreference", label("تحب نكمل معاك إزاي؟ *", "How should we reach you? *"), CONTACT_OPTIONS, true, label("اختار وسيلة التواصل", "Choose a contact method"))}
            {form.contactPreference === "email" && field("email", label("الإيميل *", "Email *"), "email", true)}
            {form.contactPreference === "call" && selectField("preferredTime", label("الوقت المفضل للمكالمة", "Preferred call time"), CALL_TIME_OPTIONS)}
            <label className="sm:col-span-2 flex items-start gap-3 text-sm leading-6 text-black/70">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) => updateField("consent", event.target.checked)}
                className="mt-1 h-4 w-4 accent-[#BBFF00]"
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? "brief-consent-error" : undefined}
                required
              />
              <span>
                {label(
                  "أوافق على استخدام بياناتي للتواصل بخصوص مشروعي فقط.",
                  "I agree that my details may be used only to discuss my project.",
                )}
              </span>
            </label>
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={(event) => update("website", event.target.value)}
              className="absolute -left-[9999px] h-px w-px opacity-0"
              tabIndex="-1"
              autoComplete="off"
              aria-hidden="true"
            />
            {errors.consent && (
              <span id="brief-consent-error" className="sm:col-span-2 -mt-3 text-xs text-red-600">
                {errors.consent}
              </span>
            )}
            <div className="sm:col-span-2 flex flex-col items-stretch justify-between gap-4 pt-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                className="zoomix-button w-full bg-[#BBFF00] text-[#0A0A0A] shadow-[0_8px_24px_rgba(187,255,0,0.15)] sm:w-auto"
              >
                {label("إرسال على واتساب", "Send to WhatsApp")} <ActionArrow size={18} />
              </button>
            </div>
            {submitError && (
              <div className="sm:col-span-2 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                <p>{submitError}</p>
                <button type="button" onClick={copyMessage} className="mt-3 font-bold underline">
                  {label("نسخ نسخة من البريف", "Copy a brief copy")}
                </button>
              </div>
            )}
            {whatsappBlocked && (
              <div className="sm:col-span-2 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p>
                  {label(
                    "لم يفتح واتساب تلقائيًا. انسخ الرسالة وأرسلها من التطبيق.",
                    "WhatsApp did not open automatically. Copy the message and send it from the app.",
                  )}
                </p>
                <button type="button" onClick={copyMessage} className="mt-3 font-bold underline">
                  {messageCopied
                    ? label("تم نسخ الرسالة", "Message copied")
                    : label("نسخ الرسالة", "Copy message")}
                </button>
              </div>
            )}
            {submitted && (
              <p
                className="sm:col-span-2 flex items-center gap-2 text-sm text-[#4d6900]"
                role="status"
                aria-live="polite"
              >
                <Check size={16} />
                {form.contactPreference === "whatsapp"
                  ? label("تم حفظ البريف وفتح واتساب.", "Brief saved and WhatsApp opened.")
                  : label("تم حفظ البريف. هنتواصل معاك بالطريقة اللي اخترتها.", "Brief saved. We will follow up using your preferred contact method.")}
                {referenceCode && <span className="font-mono font-bold">{referenceCode}</span>}
              </p>
            )}
          </form>
        </div>
      </div>
      <a
        href="https://wa.me/201555451535"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="whatsapp-float fixed left-5 z-40 w-12 h-12 bg-[#BBFF00] text-[#0A0A0A] flex items-center justify-center shadow-lg"
      >
        <MessageCircle size={22} />
      </a>
    </section>
  );
});

export default ProjectBriefSection;
