import { readDrafts, writeDraft, removeDraft } from "./drafts";
import CatalogHistory from "./CatalogHistory";
import { studioFetch } from "./api";
import { useUnsavedChanges, confirmLeave } from "./unsaved";
import { useEffect, useState } from "react";
import { Check, Eye, Package, Plus, Save, Search, X } from "lucide-react";
import {} from "../../data/commercialStudioPrototype";

import { money, margin, StatusChip, logAudit, useEscape } from "./shared";
import { reviewedCost } from "./catalogDefaults";
export default function CatalogView({
  language,
  catalog,
  setCatalog,
  storageMode,
  selectedRecord,
}) {
  const isArabic = language === "ar";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [discardPrompt, setDiscardPrompt] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creationDirty, setCreationDirty] = useState(false);
  const [publishPrompt, setPublishPrompt] = useState(false);
  useEscape(publishPrompt, () => setPublishPrompt(false));
  const activeItem = catalog.find((item) => item.id === editingId);
  const visible = catalog.filter(
    (item) =>
      (filter === "all" || item.type === filter) &&
      item.name[language].toLowerCase().includes(query.toLowerCase()),
  );
  const dirty = Boolean(
    activeItem && draft && JSON.stringify(activeItem) !== JSON.stringify(draft),
  );
  const openEditor = (item) => {
    setEditingId(item.id);
    try {
      setDraft(
        readDrafts()[`${storageMode}:catalog-edit-${item.id}`]?.draft || structuredClone(item),
      );
    } catch {
      setDraft(structuredClone(item));
    }
    setNotice("");
  };
  useUnsavedChanges(dirty || creationDirty);
  useEffect(() => {
    if (selectedRecord) {
      const item = catalog.find((row) => row.id === selectedRecord);
      if (item) openEditor(item);
    }
  }, [selectedRecord]);
  useEffect(() => {
    if (!draft || !editingId) return;
    try {
      writeDraft(`${storageMode}:catalog-edit-${editingId}`, { kind: "catalog-editor", draft });
    } catch {
      setNotice(isArabic ? "تعذر حفظ النسخة التلقائية على الجهاز." : "Device backup failed.");
    }
  }, [draft, editingId]);
  const requestClose = () =>
    dirty ? setDiscardPrompt(true) : (setEditingId(null), setDraft(null));
  const closeEditor = () => {
    try {
      if (editingId) removeDraft(`${storageMode}:catalog-edit-${editingId}`);
    } catch {
      setNotice(
        isArabic
          ? "تعذر مسح النسخة المحلية؛ حاول مرة أخرى."
          : "Could not clear device backup. Try again.",
      );
      return;
    }
    setEditingId(null);
    setDraft(null);
    setDiscardPrompt(false);
  };
  useEscape(discardPrompt, () => setDiscardPrompt(false));
  useEscape(Boolean(activeItem) && !discardPrompt && !publishPrompt, requestClose);
  useEscape(showCreate, () => {
    if (confirmLeave()) {
      setShowCreate(false);
      setCreationDirty(false);
    }
  });
  const persist = async (publishNow) => {
    const next = { ...draft, draft: !publishNow, status: publishNow ? "published" : "draft" };
    setSaving(true);
    setNotice("");
    try {
      if (storageMode === "cloud") {
        const response = await studioFetch(`/api/studio/catalog/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...next, publish: publishNow }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Save failed");
        setCatalog((items) => items.map((item) => (item.id === editingId ? result.item : item)));
        setDraft(result.item);
        setNotice(
          publishNow
            ? isArabic
              ? `تم النشر وحفظ النسخة ${result.version}.`
              : `Published and saved as version ${result.version}.`
            : isArabic
              ? `تم حفظ المسودة كنسخة ${result.version}.`
              : `Draft saved as version ${result.version}.`,
        );
      } else {
        setCatalog((items) => items.map((item) => (item.id === editingId ? next : item)));
        setDraft(next);
        setNotice(
          publishNow
            ? isArabic
              ? "تم النشر داخل النموذج المحلي فقط."
              : "Published in the local prototype only."
            : isArabic
              ? "تم حفظ المسودة داخل النموذج المحلي فقط."
              : "Draft saved in the local prototype only.",
        );
      }
      logAudit(
        "catalog_updated",
        `${editingId} · ${publishNow ? (isArabic ? "نشر" : "publish") : isArabic ? "مسودة" : "draft"}`,
      );
      if (publishNow) closeEditor();
    } catch {
      setNotice(
        isArabic
          ? "تعذر الحفظ. لم نفقد تعديلاتك؛ حاول مرة أخرى."
          : "Save failed. Your edits are still here; please try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  const createItem = async (payload) => {
    setSaving(true);
    try {
      let created = { ...payload, status: "draft", draft: true, visible: false, featured: false };
      if (storageMode === "cloud") {
        const response = await studioFetch("/api/studio/catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(created),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Create failed");
        created = result.item;
      }
      setCatalog((items) => [...items, created]);
      setShowCreate(false);
      setCreationDirty(false);
      setEditingId(created.id);
      setDraft(structuredClone(created));
      setNotice(
        isArabic
          ? "تم إنشاء البند كمسودة. أكمل التفاصيل ثم انشره."
          : "Item created as a draft. Complete its details, then publish it.",
      );
      logAudit("catalog_created", created.id);
    } catch (error) {
      setNotice(error.message || (isArabic ? "تعذر إنشاء البند." : "Could not create the item."));
    } finally {
      setSaving(false);
    }
  };
  const duplicateItem = () => {
    const suffix = Date.now().toString().slice(-6);
    createItem({
      ...draft,
      id: `${draft.id}-copy-${suffix}`,
      name: { ar: `${draft.name.ar} — نسخة`, en: `${draft.name.en} — Copy` },
      sortOrder: Number(draft.sortOrder || 0) + 1,
    });
  };
  const setArchiveState = async (archived) => {
    const nextStatus = archived ? "archived" : "draft";
    setSaving(true);
    try {
      let updated = {
        ...draft,
        status: nextStatus,
        draft: nextStatus === "draft",
        visible: archived ? false : draft.visible,
      };
      if (storageMode === "cloud") {
        const response = await studioFetch(`/api/studio/catalog/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Update failed");
        updated = result.item;
      }
      setCatalog((items) => items.map((item) => (item.id === editingId ? updated : item)));
      setDraft(updated);
      setNotice(
        archived
          ? isArabic
            ? "تمت أرشفة البند."
            : "Item archived."
          : isArabic
            ? "تمت استعادة البند كمسودة."
            : "Item restored as a draft.",
      );
      logAudit(
        "catalog_archived",
        `${editingId} · ${archived ? (isArabic ? "أرشفة" : "archive") : isArabic ? "استعادة" : "restore"}`,
      );
    } catch {
      setNotice(isArabic ? "تعذر تحديث حالة البند." : "Could not update item status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="csp-view-enter">
      <header className="csp-page-head">
        <div>
          <p className="csp-kicker">PRICING / CONTROL</p>
          <h1>{isArabic ? "قائمة الأسعار" : "PRICE LIST"}</h1>
          <p className="csp-page-description">
            {isArabic
              ? "عدّل الأسعار والباقات بأمان بدون التأثير على عروض العملاء القديمة."
              : "Manage prices and packages safely without changing existing client quotes."}
          </p>
          <span className={`csp-storage-state is-${storageMode}`}>
            {storageMode === "cloud"
              ? isArabic
                ? "متصل بقاعدة البيانات"
                : "DATABASE CONNECTED"
              : isArabic
                ? "وضع محلي تجريبي"
                : "LOCAL DEMO MODE"}
          </span>
        </div>
        <div className="csp-head-actions">
          <button type="button" className="csp-button">
            <Eye size={16} />
            {isArabic ? "معاينة الموقع" : "Preview website"}
          </button>
          <button
            type="button"
            className="csp-button csp-button--primary"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={16} />
            {isArabic ? "إضافة بند" : "Add item"}
          </button>
        </div>
      </header>

      <div className="csp-toolbar">
        <label className="csp-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isArabic ? "ابحث في قائمة الأسعار" : "Search the price list"}
            aria-label={isArabic ? "بحث قائمة الأسعار" : "Search the price list"}
          />
        </label>
        <div className="csp-filter-row">
          {[
            ["all", "ALL", "الكل"],
            ["package", "PACKAGES", "الباقات"],
            ["service", "SERVICES", "الخدمات"],
            ["addon", "ADD-ONS", "الإضافات"],
          ].map(([value, en, ar]) => (
            <button
              type="button"
              key={value}
              className={filter === value ? "is-active" : ""}
              onClick={() => setFilter(value)}
            >
              {isArabic ? ar : en}
            </button>
          ))}
        </div>
      </div>

      <div className="csp-panel csp-table-wrap">
        <div className="csp-table-head">
          <span>{isArabic ? "البند" : "Item"}</span>
          <span>{isArabic ? "النوع" : "Type"}</span>
          <span>{isArabic ? "سعر البيع" : "Sell price"}</span>
          <span>{isArabic ? "التكلفة" : "Cost"}</span>
          <span>{isArabic ? "الهامش" : "Margin"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
        </div>
        {visible.map((item) => (
          <button
            type="button"
            className="csp-table-row"
            key={item.id}
            onClick={() => openEditor(item)}
          >
            <span className="csp-item-name">
              <strong>{item.name[language]}</strong>
              <small>{item.description[language]}</small>
            </span>
            <span>
              {isArabic
                ? { package: "باقة", service: "خدمة", addon: "إضافة", expense: "مصروف" }[
                    item.type
                  ] || item.type
                : item.type}
            </span>
            <b
              className="csp-sensitive-number"
              aria-label={isArabic ? "سعر البيع بالجنيه" : "Sell price in EGP"}
            >
              {money(item.price, language)} <small>{isArabic ? "جنيه" : "EGP"}</small>
            </b>
            <span className="csp-sensitive-number">
              {reviewedCost(item) ? money(item.cost, language) : "—"}
            </span>
            <span className="csp-sensitive-number">
              {!reviewedCost(item)
                ? isArabic
                  ? "غير معتمد"
                  : "Unreviewed"
                : `${margin(item.price, item.cost)}%`}
            </span>
            <StatusChip accent={item.visible && !item.draft}>
              {item.status === "archived"
                ? isArabic
                  ? "مؤرشف"
                  : "ARCHIVED"
                : item.draft
                  ? isArabic
                    ? "مسودة"
                    : "DRAFT"
                  : item.visible
                    ? isArabic
                      ? "ظاهر"
                      : "LIVE"
                    : isArabic
                      ? "داخلي"
                      : "INTERNAL"}
            </StatusChip>
          </button>
        ))}
        {!visible.length && (
          <div className="csp-empty-state">
            <Search />
            <strong>{isArabic ? "لا توجد نتائج مطابقة" : "No matching items"}</strong>
            <span>
              {isArabic
                ? "غيّر البحث أو الفلتر وحاول مرة أخرى."
                : "Change the search or filter and try again."}
            </span>
          </div>
        )}
      </div>

      {activeItem && draft && (
        <div
          className="csp-drawer-backdrop"
          onMouseDown={(event) => event.target === event.currentTarget && requestClose()}
        >
          <aside
            className="csp-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={isArabic ? "تعديل بند" : "Edit catalog item"}
          >
            <div className="csp-drawer-head">
              <div>
                <p className="csp-kicker">CATALOG / EDIT</p>
                <h2>{draft.name[language]}</h2>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(draft.costReviewed ?? !draft.costPending)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        costReviewed: e.target.checked,
                        costPending: !e.target.checked,
                      })
                    }
                  />
                  {isArabic
                    ? "راجعت التكلفة الداخلية وأعتمدها"
                    : "I reviewed and approve the internal cost"}
                </label>
                {storageMode === "cloud" && (
                  <CatalogHistory
                    id={editingId}
                    language={language}
                    onRestored={(item) => {
                      setCatalog((rows) => rows.map((row) => (row.id === item.id ? item : row)));
                      setDraft(item);
                    }}
                  />
                )}
                <span className={`csp-save-state ${dirty ? "is-dirty" : ""}`}>
                  {dirty
                    ? isArabic
                      ? "تغييرات غير محفوظة"
                      : "Unsaved changes"
                    : isArabic
                      ? "لا توجد تغييرات"
                      : "No changes"}
                </span>
              </div>
              <button
                type="button"
                onClick={requestClose}
                aria-label={isArabic ? "إغلاق محرر السعر" : "Close price editor"}
              >
                <X />
              </button>
            </div>
            <div className="csp-form-grid">
              <label>
                <span>{isArabic ? "الاسم" : "Name"}</span>
                <input
                  value={draft.name[language]}
                  onChange={(event) =>
                    setDraft((item) => ({
                      ...item,
                      name: { ...item.name, [language]: event.target.value },
                    }))
                  }
                />
              </label>
              <label className="csp-field-wide">
                <span>{isArabic ? "الوصف" : "Description"}</span>
                <textarea
                  value={draft.description[language]}
                  onChange={(event) =>
                    setDraft((item) => ({
                      ...item,
                      description: { ...item.description, [language]: event.target.value },
                    }))
                  }
                  rows={3}
                />
              </label>
              <label>
                <span>{isArabic ? "سعر البيع (جنيه)" : "Sell price (EGP)"}</span>
                <input
                  type="number"
                  min="0"
                  value={draft.price}
                  onChange={(event) =>
                    setDraft((item) => ({ ...item, price: Number(event.target.value) }))
                  }
                />
              </label>
              <label>
                <span>{isArabic ? "التكلفة الداخلية (جنيه)" : "Internal cost (EGP)"}</span>
                <input
                  type="number"
                  min="0"
                  value={draft.cost}
                  onChange={(event) =>
                    setDraft((item) => ({ ...item, cost: Number(event.target.value) }))
                  }
                />
              </label>
              <label className="csp-field-wide">
                <span>
                  {isArabic
                    ? "البنود المشمولة — بند في كل سطر"
                    : "Included deliverables — one per line"}
                </span>
                <textarea
                  value={(draft.included?.[language] || []).join("\n")}
                  onChange={(event) =>
                    setDraft((item) => ({
                      ...item,
                      included: {
                        ...(item.included || { ar: [], en: [] }),
                        [language]: event.target.value
                          .split("\n")
                          .map((value) => value.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  rows={7}
                />
              </label>
              <label className="csp-field-wide">
                <span>{isArabic ? "المستبعد من الباقة" : "Package exclusions"}</span>
                <textarea
                  value={draft.exclusions?.[language] || ""}
                  onChange={(event) =>
                    setDraft((item) => ({
                      ...item,
                      exclusions: {
                        ...(item.exclusions || { ar: "", en: "" }),
                        [language]: event.target.value,
                      },
                    }))
                  }
                  rows={3}
                />
              </label>
              <label>
                <span>{isArabic ? "مدة التنفيذ" : "Delivery timeline"}</span>
                <input
                  value={draft.duration?.[language] || ""}
                  onChange={(event) =>
                    setDraft((item) => ({
                      ...item,
                      duration: {
                        ...(item.duration || { ar: "", en: "" }),
                        [language]: event.target.value,
                      },
                    }))
                  }
                />
              </label>
              <label>
                <span>{isArabic ? "عدد المراجعات" : "Revision rounds"}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.revisions || 0}
                  onChange={(event) =>
                    setDraft((item) => ({
                      ...item,
                      revisions: Math.max(0, Number(event.target.value)),
                    }))
                  }
                />
              </label>
            </div>
            <div
              className={`csp-margin-preview ${margin(draft.price, draft.cost) < 30 ? "is-warning" : ""}`}
            >
              <span>{isArabic ? "هامش الربح المتوقع" : "Expected margin"}</span>
              <strong>
                {(draft.costReviewed ?? !draft.costPending)
                  ? `${margin(draft.price, draft.cost)}%`
                  : isArabic
                    ? "غير متاح — راجع التكلفة"
                    : "Unavailable — review cost"}
              </strong>
            </div>
            <label className="csp-switch">
              <input
                type="checkbox"
                checked={draft.visible}
                onChange={(event) =>
                  setDraft((item) => ({ ...item, visible: event.target.checked }))
                }
              />
              <span>
                {isArabic ? "إظهار هذا البند على الموقع" : "Show this item on the website"}
              </span>
            </label>
            <div className="csp-impact-note">
              <strong>{isArabic ? "تأثير النشر" : "Publish impact"}</strong>
              <p>
                {isArabic
                  ? "العروض السابقة لن تتغير. السعر الجديد سيظهر في الاختيارات الجديدة فقط."
                  : "Existing quotes will not change. The new price will apply to new selections only."}
              </p>
            </div>
            {notice && (
              <p className="csp-success-note" role="status">
                <Check />
                {notice}
              </p>
            )}
            <div className="csp-drawer-secondary-actions">
              <button type="button" onClick={duplicateItem} disabled={saving}>
                {isArabic ? "إنشاء نسخة" : "Duplicate"}
              </button>
              <button
                type="button"
                onClick={() => setArchiveState(draft.status !== "archived")}
                disabled={saving}
              >
                {draft.status === "archived"
                  ? isArabic
                    ? "استعادة كمسودة"
                    : "Restore as draft"
                  : isArabic
                    ? "أرشفة البند"
                    : "Archive item"}
              </button>
            </div>
            <div className="csp-drawer-actions">
              <button
                type="button"
                className="csp-button"
                onClick={() => persist(false)}
                disabled={!dirty || saving}
              >
                {saving
                  ? isArabic
                    ? "جارٍ الحفظ…"
                    : "Saving…"
                  : isArabic
                    ? "حفظ كمسودة"
                    : "Save draft"}
              </button>
              <button
                type="button"
                className="csp-button csp-button--primary"
                onClick={() => setPublishPrompt(true)}
                disabled={(!dirty && !draft.draft) || saving}
              >
                <Save size={16} />
                {isArabic ? "معاينة ونشر" : "Preview & publish"}
              </button>
            </div>
          </aside>
          {publishPrompt && (
            <div className="csp-confirm-card" role="alertdialog" aria-modal="true">
              <h2>{isArabic ? "مراجعة النشر" : "Review publication"}</h2>
              <p>
                {draft.name[language]} · {money(draft.price)} EGP
              </p>
              <p>
                {isArabic ? "السعر المنشور الحالي" : "Current published price"}:{" "}
                {activeItem.publishedPrice ?? "—"} EGP
              </p>
              <p>{draft.description[language]}</p>
              <ul>
                {(draft.included?.[language] || []).map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
              <p>
                {isArabic
                  ? "لن تتغير عروض العملاء السابقة."
                  : "Existing client quotes will not change."}
              </p>
              <button className="csp-button" onClick={() => setPublishPrompt(false)}>
                {isArabic ? "رجوع" : "Back"}
              </button>
              <button
                className="csp-button csp-button--primary"
                disabled={saving}
                onClick={async () => {
                  await persist(true);
                  setPublishPrompt(false);
                }}
              >
                {isArabic ? "تأكيد النشر" : "Confirm publish"}
              </button>
            </div>
          )}
          {discardPrompt && (
            <div className="csp-confirm-card" role="alertdialog" aria-modal="true">
              <strong>{isArabic ? "تجاهل التغييرات؟" : "Discard changes?"}</strong>
              <p>
                {isArabic
                  ? "التعديلات الحالية لم تُحفظ أو تُنشر."
                  : "The current edits have not been saved or published."}
              </p>
              <div>
                <button
                  type="button"
                  className="csp-button"
                  onClick={() => setDiscardPrompt(false)}
                >
                  {isArabic ? "الاستمرار في التعديل" : "Keep editing"}
                </button>
                <button
                  type="button"
                  className="csp-button csp-button--danger"
                  onClick={closeEditor}
                >
                  {isArabic ? "تجاهل" : "Discard"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {showCreate && (
        <div className="csp-modal-backdrop">
          <form
            className="csp-modal"
            onChange={() => setCreationDirty(true)}
            role="dialog"
            aria-modal="true"
            aria-label={isArabic ? "إضافة بند جديد" : "Add catalog item"}
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              createItem({
                id: String(form.get("id")).trim().toLowerCase(),
                type: String(form.get("type")),
                category: String(form.get("category")),
                name: { ar: String(form.get("nameAr")), en: String(form.get("nameEn")) },
                description: { ar: "", en: "" },
                price: Number(form.get("price")),
                cost: Number(form.get("cost")),
                minimumPrice: Number(form.get("minimumPrice")),
                unit: "project",
              });
            }}
          >
            <div className="csp-drawer-head">
              <div>
                <p className="csp-kicker">CATALOG / NEW</p>
                <h2>{isArabic ? "إضافة بند جديد" : "Add catalog item"}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirmLeave()) {
                    setShowCreate(false);
                    setCreationDirty(false);
                  }
                }}
                aria-label={isArabic ? "إغلاق" : "Close"}
              >
                <X />
              </button>
            </div>
            <div className="csp-form-grid">
              <label>
                <span>{isArabic ? "المعرّف الإنجليزي" : "Item ID"}</span>
                <input
                  name="id"
                  required
                  pattern="[a-z0-9][a-z0-9-]{1,79}"
                  placeholder="brand-session"
                  dir="ltr"
                />
              </label>
              <label>
                <span>{isArabic ? "النوع" : "Type"}</span>
                <select name="type" defaultValue="service">
                  <option value="package">{isArabic ? "باقة" : "Package"}</option>
                  <option value="service">{isArabic ? "خدمة" : "Service"}</option>
                  <option value="addon">{isArabic ? "إضافة" : "Add-on"}</option>
                  <option value="expense">{isArabic ? "مصروف" : "Expense"}</option>
                </select>
              </label>
              <label>
                <span>{isArabic ? "الاسم العربي" : "Arabic name"}</span>
                <input name="nameAr" required />
              </label>
              <label>
                <span>{isArabic ? "الاسم الإنجليزي" : "English name"}</span>
                <input name="nameEn" required dir="ltr" />
              </label>
              <label>
                <span>{isArabic ? "التصنيف" : "Category"}</span>
                <input name="category" placeholder="content" dir="ltr" />
              </label>
              <label>
                <span>{isArabic ? "سعر البيع" : "Sell price"}</span>
                <input name="price" type="number" min="0" defaultValue="0" required />
              </label>
              <label>
                <span>{isArabic ? "التكلفة الداخلية" : "Internal cost"}</span>
                <input name="cost" type="number" min="0" defaultValue="0" required />
              </label>
              <label>
                <span>{isArabic ? "أقل سعر مسموح" : "Minimum price"}</span>
                <input name="minimumPrice" type="number" min="0" defaultValue="0" required />
              </label>
            </div>
            {notice && <p className="csp-success-note">{notice}</p>}
            <button
              type="submit"
              className="csp-button csp-button--primary csp-button--block"
              disabled={saving}
            >
              <Plus size={16} />
              {saving
                ? isArabic
                  ? "جارٍ الإنشاء…"
                  : "Creating…"
                : isArabic
                  ? "إنشاء كمسودة"
                  : "Create draft"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
