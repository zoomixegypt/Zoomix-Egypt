import { contentProductionLines } from "../../data/zoomixOfferings.js";
export function catalogDescription(item) {
  return Object.fromEntries(
    ["ar", "en"].map((language) => [
      language,
      [item?.description?.[language], ...contentProductionLines(item?.policyId || item?.id, item?.included?.[language] || [])]
        .filter(Boolean)
        .join("\n"),
    ]),
  );
}
export function catalogTerms(item, language) {
  const limitedRevision =
    language === "ar"
      ? "طلب التعديل المحدود: تعديل بسيط على مخرج واحد؛ لا يشمل فكرة جديدة أو إعادة تصميم."
      : "A limited revision request is a minor change to one deliverable, not a new concept or redesign.";
  const contentScope =
    language === "ar"
      ? "باقات المحتوى تشمل جلسة تصوير وإنتاج لمدة 6 ساعات بواسطة فريق Zoomix، وتصوير الصور والفيديوهات ومونتاج المخرجات المتفق عليها. تكلفة المعدات والانتقالات تُحدَّد حسب التنفيذ وتُوضح في عرض السعر قبل البدء."
      : "Content packages include a 6-hour shoot and production session by the Zoomix team, photography, video shooting and editing of the agreed deliverables. Equipment and travel costs depend on the production and are specified in the quote before work starts.";
  return {
    conditions:
      item?.category === "partnership"
        ? limitedRevision
        : item?.category === "content" &&
            ["content-start", "content-build", "content-campaign"].includes(item?.policyId || item?.id)
          ? contentScope
          : "",
    exclusions: item?.exclusions?.[language] || "",
    internalNotes: "",
    expiryDays: 14,
    paymentSchedule: [],
  };
}
export const reviewedCost = (item) =>
  item?.cost != null && !item.costPending && item.costReviewed !== false;
