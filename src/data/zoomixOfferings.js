export const ZOOMIX_OFFER_PATHS = [
  {
    id: "start",
    number: "01",
    title: { ar: "البداية", en: "START" },
    description: {
      ar: "لسه بتبدأ أو محتاج ترتب أساس البراند.",
      en: "You are starting out or need to organize the brand foundation.",
    },
    destination: "packages",
  },
  {
    id: "show",
    number: "02",
    title: { ar: "الظهور", en: "SHOW" },
    description: {
      ar: "البراند جاهز وعاوز يظهر بشكل أقوى.",
      en: "The brand is ready to show up with more clarity.",
    },
    choices: ["content", "events"],
  },
  {
    id: "continue",
    number: "03",
    title: { ar: "الاستمرار", en: "CONTINUE" },
    description: {
      ar: "عاوز تفضل ظاهر وتحافظ على اتجاه البراند.",
      en: "You want to stay visible and keep the brand direction consistent.",
    },
    destination: "partner",
  },
  {
    id: "one-thing",
    number: "04",
    title: { ar: "خدمة واحدة", en: "ONE THING" },
    description: {
      ar: "محتاج جزءًا محددًا فقط من التجهيز.",
      en: "You need one specific piece of the work.",
    },
    destination: "one-off",
  },
];

export const ZOOMIX_CONTENT_PACKAGES = [
  {
    id: "content-start",
    name: { ar: "محتوى البداية", en: "CONTENT START" },
    tagline: {
      ar: "محتوى مركز لبداية واضحة.",
      en: "Focused content for a clear start.",
    },
    outputs: {
      ar: [
        "جلسة تصوير وإنتاج محتوى لمدة 6 ساعات بواسطة فريق Zoomix",
        "2 فيديو قصير من تصوير فريق Zoomix، تشمل المونتاج",
        "8 صور من تصوير فريق Zoomix، معدلة وجاهزة للاستخدام",
        "Brief وShot List واتجاه إبداعي",
        "مراجعة واحدة",
      ],
      en: [
        "6-hour shoot and content production session by the Zoomix team",
        "2 short videos shot and edited by the Zoomix team",
        "8 photos shot and edited by the Zoomix team",
        "Brief, Shot List and creative direction",
        "One revision round",
      ],
    },
    price: "5,000",
    priceNote: {
      ar: "السعر يشمل التصوير وإنتاج المحتوى والمونتاج، ولا يشمل إيجار المعدات أو الانتقالات. تُوضح تكلفتهما في عرض السعر قبل البدء.",
      en: "The price includes shooting, content production and editing. Equipment rental and travel are not included; their costs are specified in the quote before work starts.",
    },
  },
  {
    id: "content-build",
    name: { ar: "محتوى التطوير", en: "CONTENT BUILD" },
    tagline: {
      ar: "محتوى أكثر تنوعًا وحضورًا أقوى.",
      en: "More variety and a stronger presence.",
    },
    outputs: {
      ar: [
        "جلسة تصوير وإنتاج محتوى لمدة 6 ساعات بواسطة فريق Zoomix",
        "3 فيديوهات قصيرة من تصوير فريق Zoomix، تشمل المونتاج",
        "15 صورة من تصوير فريق Zoomix، معدلة وجاهزة للاستخدام",
        "تطوير الفكرة والرسائل وProduction Plan",
        "مراجعتان",
      ],
      en: [
        "6-hour shoot and content production session by the Zoomix team",
        "3 short videos shot and edited by the Zoomix team",
        "15 photos shot and edited by the Zoomix team",
        "Idea, message and production-plan development",
        "Two revision rounds",
      ],
    },
    price: "7,000",
    priceNote: {
      ar: "السعر يشمل التصوير وإنتاج المحتوى والمونتاج، ولا يشمل إيجار المعدات أو الانتقالات. تُوضح تكلفتهما في عرض السعر قبل البدء.",
      en: "The price includes shooting, content production and editing. Equipment rental and travel are not included; their costs are specified in the quote before work starts.",
    },
    featured: true,
  },
  {
    id: "content-campaign",
    name: { ar: "حملة المحتوى", en: "CONTENT CAMPAIGN" },
    tagline: {
      ar: "إنتاج متكامل لحملة أو إطلاق.",
      en: "A complete production setup for a campaign or launch.",
    },
    outputs: {
      ar: [
        "جلسة تصوير وإنتاج محتوى لمدة 6 ساعات بواسطة فريق Zoomix",
        "4 فيديوهات قصيرة من تصوير فريق Zoomix، تشمل المونتاج",
        "20 صورة من تصوير فريق Zoomix، معدلة وجاهزة للاستخدام",
        "اتجاه بصري وكتابة أو تحسين الاسكريبتات",
        "مونتاج متقدم وMotion Graphics بسيطة",
        "مراجعتان",
      ],
      en: [
        "6-hour shoot and content production session by the Zoomix team",
        "4 short videos shot and edited by the Zoomix team",
        "20 photos shot and edited by the Zoomix team",
        "Visual direction and script development or refinement",
        "Advanced editing and simple motion graphics",
        "Two revision rounds",
      ],
    },
    price: "9,500",
    priceNote: {
      ar: "السعر يشمل التصوير وإنتاج المحتوى والمونتاج، ولا يشمل إيجار المعدات أو الانتقالات. تُوضح تكلفتهما في عرض السعر قبل البدء.",
      en: "The price includes shooting, content production and editing. Equipment rental and travel are not included; their costs are specified in the quote before work starts.",
    },
  },
];

// Normalize legacy wording only for the three standard content packages.
// This affects current displays/new quote defaults, never saved quote snapshots.
export function contentProductionLines(id, lines = []) {
  if (!["content-start", "content-build", "content-campaign"].includes(id)) return lines;
  return lines.map(line => String(line)
    .replace("جلسة إنتاج لمدة 6 ساعات", "جلسة تصوير وإنتاج محتوى لمدة 6 ساعات بواسطة فريق Zoomix")
    .replace("Six-hour production session", "6-hour shoot and content production session by the Zoomix team")
    .replace("من خامات العميل", "من تصوير فريق Zoomix، تشمل المونتاج")
    .replace("from client-provided footage", "shot and edited by the Zoomix team"));
}

export const ZOOMIX_EVENT_PACKAGES = [
  {
    id: "event-capture",
    name: { ar: "التوثيق", en: "CAPTURE" },
    tagline: {
      ar: "تغطية أساسية للحدث واللحظات الرئيسية.",
      en: "Essential coverage of the event and its key moments.",
    },
    outputs: {
      ar: [
        "8 ساعات تغطية",
        "مصور واحد",
        "حد أدنى 70 صورة معدلة",
        "فيديو Highlight أفقي حتى 30 ثانية",
        "مصور واحد ينفذ الصور والفيديو حسب أولويات الحدث؛ ليست تغطية متزامنة كاملة",
        "تسليم الصور خلال يومين والفيديو خلال أسبوع",
      ],
      en: [
        "Eight-hour coverage",
        "One photographer/operator",
        "Minimum 70 edited photos",
        "Landscape Highlight Video up to 30 seconds",
        "One photographer/operator handles stills and video by agreed priorities; this is not simultaneous full coverage",
        "Photos in two days and video within one week",
      ],
    },
    price: "5,000",
    priceNote: {
      ar: "الانتقالات داخل القاهرة 600 جنيه. الفيديو أفقي فقط.",
      en: "Cairo transport is 600 EGP. Landscape video only.",
    },
  },
  {
    id: "event-story",
    name: { ar: "القصة", en: "STORY" },
    tagline: {
      ar: "تغطية أكثر تفصيلًا ومادة أوضح بعد الحدث.",
      en: "More detailed coverage and a clearer story after the event.",
    },
    outputs: {
      ar: [
        "8 ساعات تغطية",
        "مصور واحد",
        "حد أدنى 100 صورة معدلة",
        "فيديو Highlight أفقي حتى 60 ثانية",
        "تحديد أولويات اللقطات قبل الحدث",
        "مصور واحد ينفذ الصور والفيديو حسب أولويات الحدث؛ ليست تغطية متزامنة كاملة",
        "تسليم الصور خلال يومين والفيديو خلال أسبوع",
      ],
      en: [
        "Eight-hour coverage",
        "One photographer/operator",
        "Minimum 100 edited photos",
        "Landscape Highlight Video up to 60 seconds",
        "Key shot priorities set before the event",
        "One photographer/operator handles stills and video by agreed priorities; this is not simultaneous full coverage",
        "Photos in two days and video within one week",
      ],
    },
    price: "6,500",
    priceNote: {
      ar: "الانتقالات داخل القاهرة 600 جنيه. الفيديو أفقي فقط.",
      en: "Cairo transport is 600 EGP. Landscape video only.",
    },
    featured: true,
  },
  {
    id: "event-signature",
    name: { ar: "التغطية الكاملة", en: "SIGNATURE" },
    tagline: {
      ar: "تغطية متزامنة بالصور والفيديو.",
      en: "Parallel photo and video coverage.",
    },
    outputs: {
      ar: [
        "8 ساعات تغطية",
        "مصور فوتوغرافي ومصور فيديو",
        "حد أدنى 120 صورة معدلة",
        "فيديو Highlight أفقي حتى 60 ثانية",
        "تغطية متزامنة كاملة بالصور والفيديو",
        "تخطيط للقطات الرئيسية والتفاصيل والبراندينج",
        "تسليم الصور خلال يومين والفيديو خلال أسبوع",
      ],
      en: [
        "Eight-hour coverage",
        "One photographer and one video operator",
        "Minimum 120 edited photos",
        "Landscape Highlight Video up to 60 seconds",
        "Full simultaneous photo and video coverage",
        "Planning for key moments, details and branding",
        "Photos in two days and video within one week",
      ],
    },
    price: "12,500",
    priceNote: {
      ar: "الانتقالات داخل القاهرة 600 جنيه. الفيديو أفقي فقط.",
      en: "Cairo transport is 600 EGP. Landscape video only.",
    },
  },
];

export const ZOOMIX_PARTNER_PACKAGES = [
  {
    id: "partner-essentials",
    name: { ar: "الشريك الإبداعي - الأساسي", en: "CREATIVE PARTNER ESSENTIALS" },
    tagline: {
      ar: "استمرار منظم يحافظ على ظهور البراند.",
      en: "Consistent creative support that keeps the brand visible.",
    },
    outputs: {
      ar: [
        "6 تصميمات منشورات",
        "8 تصميمات Stories",
        "4 فيديوهات من خامات العميل",
        "Caption كامل لكل منشور",
        "4 مكالمات تخطيط شهريًا",
        "حتى 10 طلبات تعديل محدودة",
        "كل طلب: تعديل بسيط على مخرج واحد، دون فكرة جديدة أو إعادة تصميم",
      ],
      en: [
        "6 social post designs",
        "8 Story designs",
        "4 videos from client-provided footage",
        "Full caption for every post",
        "4 planning calls per month",
        "Up to 10 limited revision requests",
        "Each request: a minor change to one deliverable, not a new concept or redesign",
      ],
    },
    price: "9,000",
  },
  {
    id: "partner-growth",
    name: { ar: "الشريك الإبداعي - النمو", en: "CREATIVE PARTNER GROWTH" },
    tagline: {
      ar: "حضور أكثر انتظامًا واتجاه محتوى أوضح.",
      en: "A more consistent presence with clearer content direction.",
    },
    outputs: {
      ar: [
        "10 تصميمات منشورات",
        "12 تصميمات Stories",
        "6 فيديوهات من خامات العميل",
        "Caption كامل لكل منشور",
        "4 مكالمات تخطيط شهريًا",
        "خطة محتوى كاملة وتطوير الرسائل",
        "حتى 15 طلب تعديل محدود",
        "كل طلب: تعديل بسيط على مخرج واحد، دون فكرة جديدة أو إعادة تصميم",
      ],
      en: [
        "10 social post designs",
        "12 Story designs",
        "6 videos from client-provided footage",
        "Full caption for every post",
        "4 planning calls per month",
        "Full content plan and message direction",
        "Up to 15 limited revision requests",
        "Each request: a minor change to one deliverable, not a new concept or redesign",
      ],
    },
    price: "13,000",
    featured: true,
  },
  {
    id: "partner-full",
    name: { ar: "الشريك الإبداعي - الكامل", en: "CREATIVE PARTNER FULL" },
    tagline: {
      ar: "شراكة إبداعية مستمرة تطور ظهور البراند.",
      en: "Ongoing creative partnership that develops the brand presence.",
    },
    outputs: {
      ar: [
        "14 تصميم منشور",
        "16 تصميم Story",
        "8 فيديوهات من خامات العميل",
        "Caption كامل لكل منشور",
        "4 مكالمات تخطيط شهريًا",
        "Creative Direction وحملتان محتوى صغيرتان",
        "مراجعة شهرية واقتراحات تحسين",
        "حتى 20 طلب تعديل محدود",
        "كل طلب: تعديل بسيط على مخرج واحد، دون فكرة جديدة أو إعادة تصميم",
      ],
      en: [
        "14 social post designs",
        "16 Story designs",
        "8 videos from client-provided footage",
        "Full caption for every post",
        "4 planning calls per month",
        "Creative direction and two small content campaigns",
        "Monthly review and improvement recommendations",
        "Up to 20 limited revision requests",
        "Each request: a minor change to one deliverable, not a new concept or redesign",
      ],
    },
    price: "18,000",
  },
];

export const ZOOMIX_ONE_OFF_SERVICES = {
  ar: [
    { id: "logo-identity", name: "Logo Direction + Mini Identity", price: "3,500 جنيه" },
    { id: "brand-guide", name: "Mini Brand Guide", price: "800 جنيه" },
    { id: "social-post", name: "تصميم بوست سوشيال", price: "400 جنيه" },
    { id: "story-template", name: "تصميم Story", price: "200 جنيه" },
    { id: "content-plan", name: "خطة محتوى لأول شهر", price: "600 جنيه" },
    { id: "video-edit", name: "مونتاج فيديو قصير", price: "يبدأ من 1,000 جنيه" },
    { id: "landing-page", name: "Landing Page حتى 6 أقسام", price: "3,500 جنيه" },
    { id: "print-design", name: "Business Card أو Flyer", price: "600 جنيه" },
    { id: "menu", name: "Menu / Price List بسيط", price: "1,200 جنيه" },
  ],
  en: [
    { id: "logo-identity", name: "Logo Direction + Mini Identity", price: "3,500 EGP" },
    { id: "brand-guide", name: "Mini Brand Guide", price: "800 EGP" },
    { id: "social-post", name: "Social post design", price: "400 EGP" },
    { id: "story-template", name: "Story template", price: "200 EGP" },
    { id: "content-plan", name: "First-month content plan", price: "600 EGP" },
    { id: "video-edit", name: "Short video edit", price: "From 1,000 EGP" },
    { id: "landing-page", name: "Landing Page up to 6 sections", price: "3,500 EGP" },
    { id: "print-design", name: "Business Card or Flyer", price: "600 EGP" },
    { id: "menu", name: "Simple Menu / Price List", price: "1,200 EGP" },
  ],
};
