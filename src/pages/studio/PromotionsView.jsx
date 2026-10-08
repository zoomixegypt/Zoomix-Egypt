import { studioFetch } from "./api";
import { useUnsavedChanges, confirmLeave } from "./unsaved";
import { useState } from "react";
import { MoreHorizontal, Plus, Save, X } from "lucide-react";
import {} from "../../data/commercialStudioPrototype";

import { StatusChip, logAudit, useEscape } from "./shared";
import { safeDate } from "./briefs";
export default function PromotionsView({
  language,
  promotions,
  setPromotions,
  storageMode,
  catalog = [],
}) {
  const isArabic = language === "ar";
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formDirty, setFormDirty] = useState(false);
  useUnsavedChanges(formDirty && showCreate);
  useEscape(showCreate, () => {
    if (confirmLeave()) {
      setShowCreate(false);
      setFormDirty(false);
    }
  });
  const createPromotion = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = Number(data.get("value"));
    const draft = {
      code: String(data.get("code")).trim().toUpperCase(),
      kind: String(data.get("kind")),
      value,
      description: {
        ar:
          data.get("kind") === "fixed"
            ? `خصم ${value} جنيه.`
            : data.get("kind") === "free-item"
              ? "إضافة مجانية مؤهلة."
              : `خصم ${value}%.`,
        en:
          data.get("kind") === "fixed"
            ? `${value} EGP discount.`
            : data.get("kind") === "free-item"
              ? "Eligible free add-on."
              : `${value}% discount.`,
      },
      limit: Number(data.get("limit")),
      startsAt: String(data.get("startDate")),
      endsAt: String(data.get("date")),
      scope: String(data.get("scope")),
      catalogIds: data.getAll("catalogIds").map(String),
      freeItemId: String(data.get("freeItemId") || ""),
      access: String(data.get("access")),
    };
    setSaving(true);
    setError("");
    try {
      if (!/^[A-Z0-9][A-Z0-9_-]{2,79}$/.test(draft.code))
        throw new Error(
          isArabic
            ? "استخدم كودًا من 3–80 حرفًا إنجليزيًا أو رقمًا أو شرطة."
            : "Use a 3–80 character code: letters, numbers, hyphen or underscore.",
        );
      if (draft.kind === "percentage" && (value <= 0 || value > 80))
        throw new Error(
          isArabic
            ? "نسبة الخصم يجب أن تكون أكبر من 0 وبحد أقصى 80%."
            : "Percentage must be above 0 and at most 80%.",
        );
      if (draft.startsAt && draft.endsAt && draft.endsAt < draft.startsAt)
        throw new Error(
          isArabic ? "تاريخ الانتهاء يسبق البداية." : "End date cannot precede start date.",
        );
      if (promotions.some((row) => row.code === draft.code))
        throw new Error(isArabic ? "كود الخصم موجود بالفعل." : "This code already exists.");
      if (draft.scope === "selected" && !draft.catalogIds.length)
        throw new Error(isArabic ? "اختر بنودًا مؤهلة للخصم." : "Select eligible items.");
      if (draft.kind === "free-item" && !draft.freeItemId)
        throw new Error(isArabic ? "اختر الإضافة المجانية." : "Select the free item.");
      let promotion = {
        ...draft,
        startsAt: draft.startsAt
          ? new Date(draft.startsAt).toISOString()
          : new Date().toISOString(),
        endsAt: draft.endsAt ? `${draft.endsAt}T23:59:59.999Z` : null,
        id: `promo-${Date.now()}`,
        status: draft.startsAt && Date.parse(draft.startsAt) > Date.now() ? "scheduled" : "active",
        uses: 0,
      };
      if (storageMode === "cloud") {
        const response = await studioFetch("/api/studio/promotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Create failed");
        promotion = result.promotion;
      }
      setPromotions((items) => [promotion, ...items]);
      setShowCreate(false);
      setFormDirty(false);
      logAudit("promotion_created", promotion.code);
    } catch (requestError) {
      setError(
        requestError.message || (isArabic ? "تعذر إنشاء الكود." : "Could not create promotion."),
      );
    } finally {
      setSaving(false);
    }
  };
  const togglePromotion = async (promotion) => {
    const status = promotion.status === "active" ? "paused" : "active";
    try {
      let updated = { ...promotion, status };
      if (storageMode === "cloud") {
        const response = await studioFetch(`/api/studio/promotions/${promotion.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Update failed");
        updated = result.promotion;
      }
      setPromotions((items) => items.map((item) => (item.id === promotion.id ? updated : item)));
      logAudit("promotion_status", `${promotion.code} · ${status}`);
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  const statusLabel = (status) =>
    isArabic
      ? { active: "نشط", scheduled: "مجدول", expired: "منتهي", paused: "متوقف" }[status] ||
        status ||
        "—"
      : String(status || "—").toUpperCase();
  return (
    <div className="csp-view-enter">
      <header className="csp-page-head">
        <div>
          <p className="csp-kicker">CAMPAIGNS / CONTROLLED DISCOUNTS</p>
          <h1>{isArabic ? "العروض والخصومات" : "PROMOTIONS"}</h1>
          <p className="csp-page-description">
            {isArabic
              ? "أنشئ خصومات محسوبة، وتابع استخدامها وتأثيرها التجاري."
              : "Create controlled offers and track their usage and commercial impact."}
          </p>
        </div>
        <button
          type="button"
          className="csp-button csp-button--primary"
          onClick={() => setShowCreate(true)}
        >
          <Plus size={16} />
          {isArabic ? "عرض جديد" : "New promotion"}
        </button>
      </header>
      {error && !showCreate && (
        <p className="csp-warning" role="alert">
          {error}
        </p>
      )}
      <section className="csp-promo-grid">
        {promotions.map((promotion) => (
          <article className="csp-promo-card" key={promotion.id}>
            <div>
              <StatusChip accent={promotion.status === "active"}>
                {statusLabel(promotion.status)}
              </StatusChip>
              <button
                type="button"
                onClick={() => togglePromotion(promotion)}
                aria-label={
                  isArabic ? `تغيير حالة كود ${promotion.code}` : `Toggle ${promotion.code}`
                }
                title={
                  promotion.status === "active"
                    ? isArabic
                      ? "إيقاف مؤقت"
                      : "Pause"
                    : isArabic
                      ? "تفعيل"
                      : "Activate"
                }
              >
                <MoreHorizontal />
              </button>
            </div>
            <strong>{promotion.code}</strong>
            <span className="csp-promo-value">
              {promotion.kind === "percentage"
                ? `${promotion.value}%`
                : promotion.kind === "fixed"
                  ? `${promotion.value} ${isArabic ? "جنيه" : "EGP"}`
                  : isArabic
                    ? "إضافة مجانية"
                    : "FREE ITEM"}
            </span>
            <p>{promotion.description?.[language] || ""}</p>
            <div className="csp-promo-meta">
              <span>
                {isArabic ? "النطاق" : "Scope"}
                <b>{promotion.scope || (isArabic ? "عروض مختارة" : "Selected quotes")}</b>
              </span>
              <span>
                {isArabic ? "النوع" : "Access"}
                <b>{promotion.access || (isArabic ? "كود خاص" : "Private code")}</b>
              </span>
            </div>
            <footer>
              <span>
                {isArabic
                  ? `${promotion.uses} من ${promotion.limit} استخدام`
                  : `${promotion.uses} of ${promotion.limit} uses`}
              </span>
              <b>
                {promotion.endsAt
                  ? safeDate(promotion.endsAt, language)
                  : isArabic
                    ? "بدون تاريخ انتهاء"
                    : "No expiry"}
              </b>
            </footer>
          </article>
        ))}
      </section>
      {showCreate && (
        <div className="csp-modal-backdrop">
          <form
            className="csp-modal"
            role="dialog"
            aria-modal="true"
            aria-label={isArabic ? "إنشاء عرض ترويجي" : "Create promotion"}
            onSubmit={createPromotion}
            onChange={() => setFormDirty(true)}
          >
            <div className="csp-drawer-head">
              <div>
                <p className="csp-kicker">PROMOTION / NEW</p>
                <h2>{isArabic ? "إنشاء عرض ترويجي" : "Create promotion"}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirmLeave()) {
                    setShowCreate(false);
                    setFormDirty(false);
                  }
                }}
                aria-label={isArabic ? "إغلاق إنشاء العرض الترويجي" : "Close promotion creator"}
              >
                <X />
              </button>
            </div>
            <label>
              <span>
                {isArabic
                  ? "البنود المؤهلة عند اختيار نطاق محدد"
                  : "Eligible items for selected scope"}
              </span>
              <select name="catalogIds" multiple>
                {catalog.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name[language]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{isArabic ? "الإضافة المجانية — وحدة واحدة" : "Free item — one unit"}</span>
              <select name="freeItemId" defaultValue="">
                <option value="">—</option>
                {catalog
                  .filter((item) => item.type === "addon")
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name[language]}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>{isArabic ? "الكود" : "Code"}</span>
              <input name="code" required placeholder="OCTOBER10" />
            </label>
            <div className="csp-form-grid">
              <label>
                <span>{isArabic ? "نوع العرض" : "Promotion type"}</span>
                <select name="kind" defaultValue="percentage">
                  <option value="percentage">
                    {isArabic ? "خصم نسبة مئوية" : "Percentage discount"}
                  </option>
                  <option value="free-item">{isArabic ? "إضافة مجانية" : "Free item"}</option>
                  <option value="fixed">{isArabic ? "خصم مبلغ ثابت" : "Fixed amount"}</option>
                </select>
              </label>
              <label>
                <span>{isArabic ? "قيمة الخصم" : "Discount value"}</span>
                <input name="value" type="number" min="1" defaultValue="10" required />
              </label>
              <label>
                <span>{isArabic ? "النطاق" : "Applies to"}</span>
                <select name="scope" defaultValue="all">
                  <option value="foundation">
                    {isArabic ? "باقات التأسيس" : "Foundation packages"}
                  </option>
                  <option value="all">{isArabic ? "كل الباقات" : "All packages"}</option>
                  <option value="selected">{isArabic ? "بنود مختارة" : "Selected items"}</option>
                </select>
              </label>
              <label>
                <span>{isArabic ? "طريقة الوصول" : "Access"}</span>
                <select name="access" defaultValue="private">
                  <option value="private">{isArabic ? "كود خاص" : "Private code"}</option>
                  <option value="public">
                    {isArabic ? "ظاهر على الموقع" : "Public on website"}
                  </option>
                </select>
              </label>
              <label>
                <span>{isArabic ? "تاريخ البداية" : "Start date"}</span>
                <input
                  name="startDate"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  required
                />
              </label>
              <label>
                <span>{isArabic ? "تاريخ الانتهاء" : "End date"}</span>
                <input name="date" type="date" />
              </label>
              <label className="csp-field-wide">
                <span>{isArabic ? "حد الاستخدام" : "Usage limit"}</span>
                <input name="limit" type="number" min="1" defaultValue="20" required />
              </label>
            </div>
            {error && (
              <p className="csp-warning" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="csp-button csp-button--primary csp-button--block"
              disabled={saving}
            >
              <Save size={16} />
              {saving
                ? isArabic
                  ? "جارٍ الحفظ…"
                  : "Saving…"
                : isArabic
                  ? "حفظ العرض"
                  : "Save promotion"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
