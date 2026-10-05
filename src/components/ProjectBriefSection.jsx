import { useEffect, useMemo, useState, memo } from "react";
import { ArrowUpLeft, ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { useLanguage } from "../i18n";
import { ZOOMIX_PACKAGES } from "../data/zoomixPackages";

const initialForm = {
  name: "",
  project: "",
  phone: "",
  activity: "",
  service: "",
  packageId: "",
  stage: "",
  budget: "",
  launchDate: "",
  description: "",
};

const ProjectBriefSection = memo(function ProjectBriefSection() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [whatsappBlocked, setWhatsappBlocked] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);

  useEffect(() => {
    const applyPackage = (id) =>
      setForm((current) => ({ ...current, packageId: id || current.packageId }));
    applyPackage(window.localStorage.getItem("zoomix-selected-package"));
    const onPackageSelect = (event) => applyPackage(event.detail);
    window.addEventListener("zoomix:package-select", onPackageSelect);
    return () => window.removeEventListener("zoomix:package-select", onPackageSelect);
  }, []);

  const selectedPackage = useMemo(
    () => ZOOMIX_PACKAGES.find((pkg) => pkg.id === form.packageId),
    [form.packageId],
  );
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const label = (ar, en) => (isArabic ? ar : en);
  const ActionArrow = isArabic ? ArrowUpLeft : ArrowUpRight;

  const buildMessage = () =>
    [
      `ZOOMIX PROJECT BRIEF`,
      `${label("الاسم", "Name")}: ${form.name}`,
      `${label("اسم المشروع", "Project")}: ${form.project}`,
      `${label("رقم الهاتف", "Phone")}: ${form.phone}`,
      `${label("نوع النشاط", "Activity")}: ${form.activity}`,
      `${label("نوع الخدمة", "Service")}: ${form.service}`,
      `${label("الباقة", "Package")}: ${selectedPackage?.name[language] || label("لم يتم الاختيار", "Not selected")}`,
      `${label("المرحلة الحالية", "Current stage")}: ${form.stage}`,
      `${label("الميزانية التقريبية", "Approx. budget")}: ${form.budget}`,
      `${label("موعد الإطلاق", "Launch date")}: ${form.launchDate}`,
      `${label("الوصف", "Description")}: ${form.description}`,
    ].join("\n");

  const handleSubmit = (event) => {
    event.preventDefault();
    const required = ["name", "phone", "service", "description"];
    const nextErrors = Object.fromEntries(
      required.filter((key) => !form[key].trim()).map((key) => [key, label("مطلوب", "Required")]),
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSubmitted(false);
      return;
    }
    setSubmitted(true);
    const whatsappWindow = window.open(
      `https://wa.me/201555451535?text=${encodeURIComponent(buildMessage())}`,
      "_blank",
      "noopener,noreferrer",
    );
    setWhatsappBlocked(!whatsappWindow);
    setMessageCopied(false);
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(buildMessage());
      setMessageCopied(true);
    } catch {
      setMessageCopied(false);
    }
  };

  const field = (key, labelText, type = "text", required = false) => (
    <label className="block">
      <span className="block text-sm font-bold mb-2">{labelText}</span>
      <input
        id={`brief-${key}`}
        type={type}
        value={form[key]}
        onChange={(event) => update(key, event.target.value)}
        className={`w-full border bg-white px-4 py-3 outline-none focus:border-[#BBFF00] ${errors[key] ? "border-red-500" : "border-black/20"}`}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `brief-${key}-error` : undefined}
        required={required}
      />
      {errors[key] && (
        <span id={`brief-${key}-error`} className="block mt-1 text-xs text-red-600">
          {errors[key]}
        </span>
      )}
    </label>
  );

  return (
    <section
      id="contact-section"
      className="zoomix-section bg-[#0A0A0A] text-white"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex items-center gap-4 mb-12">
          <span className="w-2 h-2 bg-[#BBFF00]" />
          <span className="zoomix-label">05. {label("نبدأ من هنا", "PROJECT BRIEF")}</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>
        <div className="grid lg:grid-cols-[0.75fr_1.25fr] gap-12 items-start">
          <div className="lg:sticky lg:top-24">
            <h2
              className={`${isArabic ? "font-arabic tracking-normal" : "font-display tracking-[-0.06em]"} text-5xl md:text-7xl font-black leading-[0.92]`}
            >
              {label("جاهز نرتب", "LET'S BUILD")}
              <br />
              <span className="text-[#BBFF00]">{label("صورة مشروعك؟", "SOMETHING CLEAR.")}</span>
            </h2>
            <p className="mt-8 text-white/60 leading-7">
              {label(
                "ابعت التفاصيل الأساسية، وهنرتب الخطوة التالية على واتساب.",
                "Share the essentials and we will organize the next step on WhatsApp.",
              )}
            </p>
            <a
              href="https://wa.me/201555451535"
              className="mt-8 inline-flex items-center gap-3 text-[#BBFF00] font-bold"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={20} /> +20 15 5545 1535
            </a>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-[#F5F4EF] text-[#0A0A0A] p-6 md:p-10 grid sm:grid-cols-2 gap-5"
          >
            {field("name", label("الاسم *", "Name *"), "text", true)}
            {field("project", label("اسم المشروع", "Project name"))}
            {field("phone", label("رقم الهاتف *", "Phone *"), "tel", true)}
            {field("activity", label("نوع النشاط", "Business type"))}
            {field("service", label("نوع الخدمة *", "Service type *"), "text", true)}
            <label className="block">
              <span className="block text-sm font-bold mb-2">{label("الباقة", "Package")}</span>
              <select
                value={form.packageId}
                onChange={(event) => update("packageId", event.target.value)}
                className="w-full border border-black/20 bg-white px-4 py-3"
              >
                <option value="">{label("اختار الباقة", "Choose a package")}</option>
                {ZOOMIX_PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name[language]} — {pkg.price} {label("جنيه", "EGP")}
                  </option>
                ))}
              </select>
            </label>
            {field("stage", label("المرحلة الحالية", "Current stage"))}
            {field("budget", label("الميزانية التقريبية", "Approx. budget"))}
            {field("launchDate", label("موعد الإطلاق", "Launch date"), "date")}
            <label className="block sm:col-span-2">
              <span className="block text-sm font-bold mb-2">
                {label("وصف مختصر *", "Short description *")}
              </span>
              <textarea
                id="brief-description"
                rows="5"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                className={`w-full border bg-white px-4 py-3 outline-none focus:border-[#BBFF00] ${errors.description ? "border-red-500" : "border-black/20"}`}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? "brief-description-error" : undefined}
                required
              />
              {errors.description && (
                <span id="brief-description-error" className="block mt-1 text-xs text-red-600">
                  {errors.description}
                </span>
              )}
            </label>
            <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3">
              <p className="text-xs text-black/55">
                {label(
                  "سيتم فتح واتساب بعد الضغط فقط، ولا يتم حفظ البيانات على Server.",
                  "WhatsApp opens only after submit; no server database is used.",
                )}
              </p>
              <button type="submit" className="zoomix-button bg-[#BBFF00] text-[#0A0A0A]">
                {label("إرسال على واتساب", "Send to WhatsApp")} <ActionArrow size={18} />
              </button>
            </div>
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
              >
                <Check size={16} />
                {label("تم تجهيز الرسالة وفتح واتساب.", "Message prepared and WhatsApp opened.")}
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
