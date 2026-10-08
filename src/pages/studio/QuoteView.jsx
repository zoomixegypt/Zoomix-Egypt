import { writeDraft, readDrafts, removeDraft } from "./drafts";
import { useUnsavedChanges } from "./unsaved";
import { calculateCommercial, promotionError } from "../../../public/commercial-rules";
import { studioRequest } from "./api";
import { studioFetch } from "./api";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  CircleDollarSign,
  Eye,
  MessageCircle,
  Package,
  Plus,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { money, margin, StatusChip, logAudit, useEscape, shortTime } from "./shared";
import { briefLabel, resolveLeadOffer } from "./briefs";
export default function QuoteView({
  language,
  catalog,
  promotions,
  storageMode,
  onQuoteSaved,
  lead,
  requests = [],
  freshToken,
  freshRef,
  draftId = "working",
  selectedQuoteId,
  liveQuoteStatus,
}) {
  const isArabic = language === "ar";
  const storageKey = `${storageMode}:${draftId}`;
  const matchedCatalogItem = resolveLeadOffer(lead, catalog);
  const defaultItems = () =>
    matchedCatalogItem
      ? [
          {
            rowId: `lead-${matchedCatalogItem.id}`,
            catalogId: matchedCatalogItem.id,
            category: matchedCatalogItem.category,
            name: matchedCatalogItem.name,
            description: matchedCatalogItem.description,
            quantity: 1,
            unitPrice: matchedCatalogItem.price,
            cost: matchedCatalogItem.cost,
            costPending: Boolean(matchedCatalogItem.costPending),
            discount: 0,
            optional: false,
          },
        ]
      : [];
  const [items, setItems] = useState(defaultItems);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoMessage, setPromoMessage] = useState(null);
  const [taxPercent, setTaxPercent] = useState(0);
  const [depositPercent, setDepositPercent] = useState(60);
  const [duration, setDuration] = useState(matchedCatalogItem?.duration?.[language] || "");
  const [revisions, setRevisions] = useState(2);
  const [preview, setPreview] = useState(false);
  const [clientExtras, setClientExtras] = useState({ "row-2": true });
  const [clientNotice, setClientNotice] = useState("");
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [changeRequested, setChangeRequested] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [sendChannel, setSendChannel] = useState("copy");
  const [sent, setSent] = useState(null);
  const [saveState, setSaveState] = useState("draft");
  const [quoteRecord, setQuoteRecord] = useState(null);
  const [revisionRequest, setRevisionRequest] = useState(null);
  const [testModeBusy, setTestModeBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [clientName, setClientName] = useState(lead?.name || "");
  const [projectName, setProjectName] = useState(lead?.project || "");
  const [briefRequestId, setBriefRequestId] = useState(lead?.id || null);
  const linkedLead =
    (requests || []).find((row) => String(row.id) === String(briefRequestId)) ||
    (lead && String(lead.id) === String(briefRequestId) ? lead : null);
  const [draftReady, setDraftReady] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const [localSavedAt, setLocalSavedAt] = useState("");
  const [savedDiscountPlan, setSavedDiscountPlan] = useState(null);
  const skipBackup = useRef(false);
  useEffect(() => {
    if (liveQuoteStatus)
      setQuoteRecord((current) =>
        current && String(current.id) === String(selectedQuoteId)
          ? { ...current, status: liveQuoteStatus }
          : current,
      );
  }, [liveQuoteStatus, selectedQuoteId]);
  const previousLanguage = useRef(language);
  useEffect(() => {
    if (previousLanguage.current !== language && draftReady && quoteRecord?.status !== "accepted")
      setSaveState("dirty");
    previousLanguage.current = language;
  }, [language, draftReady, quoteRecord?.status]);
  useUnsavedChanges(saveState === "dirty" || saveState === "saving");

  useEffect(() => {
    let active = true;
    let failed = false;
    let fetchingQuote = false;
    const restore = (saved) => {
      setItems(saved.items || []);
      setClientExtras(
        Object.fromEntries(
          (saved.items || []).filter((item) => item.optional).map((item) => [item.rowId, true]),
        ),
      );
      setTaxPercent(saved.taxPercent || 0);
      setDepositPercent(saved.depositPercent ?? 60);
      setDuration(saved.duration || saved.timeline || "");
      setRevisions(saved.revisions ?? 2);
      setPromoInput(saved.promoCode || "");
      setAppliedPromo(saved.promoCode || "");
      setPromoMessage(saved.promoMessage || null);
      setClientName(saved.clientName || "");
      setProjectName(saved.projectName || "");
      setBriefRequestId(saved.briefRequestId ?? null);
      setQuoteRecord(saved.record || null);
      setRevisionRequest(saved.revisionRequest || null);
      setSaveState(saved.cloudDirty ? "dirty" : saved.record ? "saved" : "draft");
      setLocalSavedAt(saved.savedAt || "");
      setSavedDiscountPlan(saved.discountPlan || null);
    };
    (async () => {
      try {
        let saved = null;
        try {
          saved = readDrafts()[storageKey];
        } catch {
          if (active)
            setSaveError(isArabic ? "الحفظ المحلي غير متاح." : "Device backup is unavailable.");
        }
        const cloudId = selectedQuoteId || (storageMode === "cloud" ? saved?.record?.id : null);
        if (saved && (saved.cloudDirty || !cloudId || storageMode === "local")) {
          restore(saved);
          if (cloudId && storageMode === "cloud") {
            // Keep unsaved item edits, but never hide new client responses or an acceptance lock.
            const latest = await studioRequest(`/api/studio/quotes/${cloudId}`);
            if (active) {
              setRevisionRequest(latest.draft.revisionRequest || null);
              setQuoteRecord((current) =>
                current
                  ? {
                      ...current,
                      status: latest.draft.record.status,
                      isTest: latest.draft.record.isTest,
                    }
                  : latest.draft.record,
              );
            }
          }
        } else if (cloudId && storageMode === "cloud") {
          fetchingQuote = true;
          const result = await studioRequest(`/api/studio/quotes/${cloudId}`);
          if (active) restore(result.draft);
        } else if (storageMode === "local" && draftId === "working") {
          const legacy = JSON.parse(localStorage.getItem("zoomix-studio-quote-draft") || "null");
          if (legacy && active) restore(legacy);
        }
      } catch (error) {
        failed = Boolean((selectedQuoteId || fetchingQuote) && storageMode === "cloud");
        if (active) setLoadFailed(failed);
        if (active) setSaveError(error.message);
      } finally {
        if (active && !failed) setDraftReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [draftId, selectedQuoteId, storageMode, loadAttempt]);
  useEffect(() => {
    if (!draftReady || skipBackup.current) return;
    try {
      const saved = writeDraft(storageKey, {
        kind: "quote",
        items,
        taxPercent,
        depositPercent,
        duration,
        revisions,
        promoCode: appliedPromo,
        promoMessage,
        clientName,
        projectName,
        briefRequestId,
        record: quoteRecord,
        revisionRequest,
        cloudDirty: ["dirty", "saving"].includes(saveState),
        discountPlan: savedDiscountPlan,
      });
      setLocalSavedAt(saved.savedAt);
    } catch (error) {
      setSaveError(
        isArabic
          ? "تعذر حفظ النسخة التلقائية على هذا الجهاز. احفظ في قاعدة البيانات قبل المغادرة."
          : "Automatic device backup failed. Save to the database before leaving.",
      );
    }
  }, [
    draftReady,
    draftId,
    items,
    taxPercent,
    depositPercent,
    duration,
    revisions,
    appliedPromo,
    promoMessage,
    clientName,
    projectName,
    briefRequestId,
    quoteRecord,
    revisionRequest,
    saveState,
    savedDiscountPlan,
  ]);
  useEffect(() => {
    setDuration((current) =>
      current === "18–21 يومًا" || current === "18–21 days"
        ? isArabic
          ? "18–21 يومًا"
          : "18–21 days"
        : current,
    );
  }, [isArabic]);

  const rowTotal = (row) => Math.max(0, row.unitPrice * row.quantity - Number(row.discount || 0));
  const subtotal = calculateCommercial(items).subtotalMinor / 100;
  const cost = items.reduce((sum, row) => sum + Number(row.cost || 0) * row.quantity, 0);
  const costsPending = items.some((row) => row.costPending);
  const promo = promotions.find((item) => item.code === appliedPromo);
  const validPromo = promo && !promotionError(promo) ? promo : null;
  const calculation = calculateCommercial(
    items.map((item) => ({
      ...item,
      category: catalog.find((row) => row.id === item.catalogId)?.category || item.category,
    })),
    validPromo,
    taxPercent,
    savedDiscountPlan,
  );
  const discount = calculation.discountMinor / 100;
  const tax = calculation.taxMinor / 100;
  const total = calculation.totalMinor / 100;
  const quoteMargin = margin(subtotal - discount, cost);
  const markDirty = () => {
    setSaveError("");
    skipBackup.current = false;
    setSavedDiscountPlan(null);
    setSaveState("dirty");
  };
  const saveStateLabel = {
    draft: isArabic ? "مسودة · لم تُحفظ" : "Draft · unsaved",
    dirty: isArabic ? "تغييرات غير محفوظة" : "Unsaved changes",
    saving: isArabic ? "جارٍ الحفظ…" : "Saving…",
    saved: isArabic
      ? `${storageMode === "local" ? "حفظ على الجهاز فقط" : "محفوظ في قاعدة البيانات"} · الإصدار ${quoteRecord?.version || 1}`
      : `${storageMode === "local" ? "Saved on device only" : "Saved in database"} · version ${quoteRecord?.version || 1}`,
  }[saveState];
  const promoMessageLabel =
    promoMessage?.key === "invalid"
      ? isArabic
        ? "الكود غير صالح."
        : "This code is not valid."
      : promoMessage?.key === "inactive"
        ? isArabic
          ? "الكود غير نشط حاليًا."
          : "This code is not active yet."
        : promoMessage?.key === "fixed"
          ? `${promoMessage.value} ${isArabic ? "جنيه خصم" : "EGP discount"}`
          : promoMessage?.key === "free"
            ? isArabic
              ? "تم تطبيق الإضافة المجانية."
              : "Free add-on applied."
            : isArabic
              ? `تم تطبيق خصم ${promoMessage?.value || 0}% بنجاح.`
              : `${promoMessage?.value || 0}% discount applied successfully.`;
  const addItem = (catalogId) => {
    const item = catalog.find((entry) => entry.id === catalogId);
    if (!item) return;
    setItems((current) => [
      ...current,
      {
        rowId: `row-${Date.now()}`,
        catalogId,
        category: item.category,
        name: item.name,
        description: item.description,
        quantity: 1,
        unitPrice: item.price,
        cost: item.cost,
        discount: 0,
        optional: false,
      },
    ]);
    markDirty();
  };
  const addCustomItem = () => {
    setItems((current) => [
      ...current,
      {
        rowId: `custom-${Date.now()}`,
        catalogId: null,
        name: { ar: "بند مخصص جديد", en: "New custom item" },
        description: { ar: "اكتب وصف نطاق البند.", en: "Describe the item scope." },
        quantity: 1,
        unitPrice: 0,
        cost: 0,
        costPending: true,
        discount: 0,
        optional: false,
      },
    ]);
    markDirty();
  };
  const updateRow = (rowId, patch) => {
    setItems((current) => current.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)));
    markDirty();
  };
  const removeRow = (rowId) => {
    setItems((current) => current.filter((row) => row.rowId !== rowId));
    markDirty();
  };
  const moveRow = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    markDirty();
  };
  const applyPromo = () => {
    markDirty();
    if (!promoInput.trim()) {
      setAppliedPromo("");
      setPromoMessage(null);
      setSavedDiscountPlan(null);
      return;
    }
    const nextPromo = promotions.find((item) => item.code === promoInput.trim().toUpperCase());
    if (!nextPromo) {
      setAppliedPromo("");
      setPromoMessage({ type: "error", key: "invalid" });
      return;
    }
    if (promotionError(nextPromo)) {
      setAppliedPromo("");
      setPromoMessage({ type: "error", key: "inactive" });
      return;
    }
    const eligibleCalculation = calculateCommercial(
      items.map((item) => ({
        ...item,
        category: catalog.find((row) => row.id === item.catalogId)?.category || item.category,
      })),
      nextPromo,
      taxPercent,
    );
    if (!eligibleCalculation.discountMinor) {
      setAppliedPromo("");
      setPromoMessage({ type: "error", key: "scope" });
      setSaveError(
        isArabic
          ? "الكود لا ينطبق على البنود الحالية. أضف الباقة والإضافة المؤهلة أولًا."
          : "The code does not apply. Add eligible items first.",
      );
      return;
    }
    setAppliedPromo(nextPromo.code);
    setPromoMessage({
      type: "success",
      key:
        nextPromo.kind === "percentage"
          ? "discount"
          : nextPromo.kind === "free-item"
            ? "free"
            : "fixed",
      value: nextPromo.value,
    });
    markDirty();
  };
  const saveDraft = async () => {
    if (quoteRecord?.status === "accepted") return null;
    if (
      !items.length ||
      !clientName.trim() ||
      !projectName.trim() ||
      !duration.trim() ||
      costsPending
    ) {
      setSaveError(
        isArabic
          ? "أدخل اسم العميل والمشروع ومدة التنفيذ وبندًا واحدًا على الأقل، وراجع تكلفة كل بند قبل الحفظ."
          : "Enter client/project names, delivery time and at least one item; review every internal cost before saving.",
      );
      return null;
    }
    if (!draftReady || saveState === "saving") return null;
    setSaveState("saving");
    setSaveError("");
    const payload = {
      briefRequestId,
      baseVersion: quoteRecord?.version,
      clientName,
      projectName,
      language,
      items,
      discount,
      taxPercent,
      depositPercent,
      timeline: duration,
      revisions,
      promoCode: appliedPromo,
    };
    try {
      if (storageMode === "cloud") {
        const endpoint = quoteRecord
          ? `/api/studio/quotes/${quoteRecord.id}/versions`
          : "/api/studio/quotes";
        const response = await studioFetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Save failed");
        setQuoteRecord(result.quote);
        setSavedDiscountPlan(result.quote.discountPlan || null);
        onQuoteSaved?.(result.quote);
        setSaveState("saved");
        return result.quote;
      } else {
        const localRecord = {
          id: quoteRecord?.id || `local-${draftId}`,
          reference: quoteRecord?.reference || `QT-LOCAL-${draftId.slice(-8).toUpperCase()}`,
          version: (quoteRecord?.version || 0) + 1,
          total,
        };
        writeDraft(storageKey, {
          items,
          taxPercent,
          depositPercent,
          duration,
          revisions,
          promoCode: appliedPromo,
          promoMessage,
          clientName,
          projectName,
          briefRequestId,
          record: localRecord,
          kind: "quote",
          discountPlan: calculation.allocations,
        });
        setQuoteRecord(localRecord);
        setSavedDiscountPlan(calculation.allocations);
        setSaveState("saved");
        logAudit(
          "quote_saved",
          `${localRecord.reference} · ${payload.clientName} · v${localRecord.version}`,
        );
        return localRecord;
      }
    } catch (error) {
      setSaveState("dirty");
      setSaveError(error.message || (isArabic ? "تعذر حفظ العرض." : "Could not save the quote."));
      return null;
    }
  };
  const sendQuote = async () => {
    if (sendBusy) return;
    setSendBusy(true);
    setSaveError("");
    try {
      let record = quoteRecord;
      if (!record || saveState !== "saved") record = await saveDraft();
      if (!record) return;
      if (storageMode !== "cloud") {
        setSent({ channel: sendChannel, clientUrl: "" });
        setSendOpen(false);
        logAudit("quote_sent", `${record.reference} · ${sendChannel}`);
        return;
      }
      const response = await studioFetch(`/api/studio/quotes/${record.id}/send`, {
        method: "POST",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Send failed");
      if (sendChannel === "copy" && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(result.clientUrl);
        } catch {
          setSaveError(
            isArabic
              ? "الرابط جاهز، لكن تعذر نسخه تلقائيًا. افتح العرض وانسخ الرابط يدويًا."
              : "The link is ready, but automatic copying failed. Open the quote and copy its URL.",
          );
        }
      }
      setSent({ channel: sendChannel, clientUrl: result.clientUrl, expiresAt: result.expiresAt });
      setQuoteRecord({ ...record, status: "sent" });
      onQuoteSaved?.({
        ...record,
        status: "sent",
        expiresAt: result.expiresAt,
        updatedAt: new Date().toISOString(),
        lastEvent: "sent",
        lastEventAt: new Date().toISOString(),
      });
      setSendOpen(false);
    } catch (error) {
      setSaveError(
        error.message ||
          (isArabic ? "تعذر إصدار رابط العميل." : "Could not issue the client link."),
      );
    } finally {
      setSendBusy(false);
    }
  };
  const quoteReferenceLabel = quoteRecord?.reference || "QT-NEW-DRAFT";
  const quoteVersionLabel = quoteRecord?.version || 1;
  useEscape(sendOpen, () => setSendOpen(false));
  useEscape(acceptOpen, () => setAcceptOpen(false));
  useEscape(preview && !acceptOpen, () => setPreview(false));
  if (!draftReady)
    return (
      <section className="csp-panel">
        <p role={saveError ? "alert" : "status"}>
          {saveError || (isArabic ? "جارٍ تحميل العرض…" : "Loading quote…")}
        </p>
        {saveError && (
          <button
            className="csp-button"
            onClick={() => {
              setSaveError("");
              setLoadAttempt((value) => value + 1);
            }}
          >
            {isArabic ? "إعادة المحاولة" : "Retry"}
          </button>
        )}
      </section>
    );

  if (preview) {
    const selectedRows = items.filter((row) => !row.optional || clientExtras[row.rowId]);
    const clientSubtotal = calculateCommercial(selectedRows).subtotalMinor / 100;
    const clientDiscount =
      calculateCommercial(
        selectedRows.map((row) => ({ ...row, sortOrder: items.indexOf(row) })),
        null,
        taxPercent,
        Object.fromEntries(calculation.allocations.map((value, index) => [index, value])),
      ).discountMinor / 100;
    const clientTax =
      Math.round(((clientSubtotal - clientDiscount) * 100 * taxPercent) / 100) / 100;
    const clientTotal = clientSubtotal - clientDiscount + clientTax;
    const changeExtra = (row, checked) => {
      setClientExtras((current) => ({ ...current, [row.rowId]: checked }));
      const delta = rowTotal(row) * (1 - (promo?.kind === "percentage" ? promo.value : 0) / 100);
      setClientNotice(
        checked
          ? isArabic
            ? `تمت إضافة ${row.name.ar} · +${money(delta, language)} جنيه`
            : `${row.name.en} added · +${money(delta, language)} EGP`
          : isArabic
            ? `تم استبعاد ${row.name.ar} · −${money(delta, language)} جنيه`
            : `${row.name.en} removed · −${money(delta, language)} EGP`,
      );
    };
    return (
      <div className="csp-client-page csp-view-enter">
        <header>
          <button type="button" onClick={() => setPreview(false)}>
            <ChevronLeft size={17} />
            {isArabic ? "العودة للمحرر" : "Back to editor"}
          </button>
          <span>ZOOMIX / QUOTE</span>
          <span>{quoteReferenceLabel}</span>
        </header>
        <main>
          <p className="csp-kicker">
            {isArabic ? "عرض سعر" : "PROPOSAL"} / {clientName || "—"}
          </p>
          <h1>{projectName || (isArabic ? "عرض سعر المشروع" : "Project proposal")}</h1>
          <p className="csp-client-intro">
            {isArabic
              ? "راجع نطاق العمل والبنود والتكلفة ومدة التنفيذ المقترحة لمشروعك. هذه معاينة داخلية، وليست قبولًا فعليًا من العميل."
              : "Review the scope, pricing and proposed delivery time for your project. This internal preview does not record client acceptance."}
          </p>
          <section className="csp-client-scope">
            <div>
              <p className="csp-kicker">SCOPE / INCLUDED</p>
              <h2>{isArabic ? "نطاق العمل" : "Project scope"}</h2>
            </div>
            <div>
              {items
                .filter((row) => !row.optional)
                .map((row) => (
                  <article key={row.rowId}>
                    <Check size={18} />
                    <span>
                      <strong>{row.name[language]}</strong>
                      <small>{row.description[language]}</small>
                    </span>
                    <b>
                      {money(rowTotal(row), language)} {isArabic ? "جنيه" : "EGP"}
                    </b>
                  </article>
                ))}
            </div>
          </section>
          <section className="csp-client-addons">
            <p className="csp-kicker">OPTIONAL / YOUR CHOICE</p>
            <h2>{isArabic ? "إضافات اختيارية" : "Optional additions"}</h2>
            {items
              .filter((row) => row.optional)
              .map((row) => (
                <label key={row.rowId}>
                  <input
                    type="checkbox"
                    checked={Boolean(clientExtras[row.rowId])}
                    onChange={(event) => changeExtra(row, event.target.checked)}
                  />
                  <span>
                    <strong>{row.name[language]}</strong>
                    <small>
                      {row.quantity} × {money(row.unitPrice, language)} {isArabic ? "جنيه" : "EGP"}
                    </small>
                  </span>
                </label>
              ))}
            {clientNotice && (
              <p className="csp-client-notice" aria-live="polite">
                {clientNotice}
              </p>
            )}
          </section>
          <section className="csp-client-selection-summary">
            <p className="csp-kicker">FINAL SELECTION</p>
            {selectedRows.map((row) => (
              <div key={row.rowId}>
                <span>
                  {row.name[language]} × {row.quantity}
                </span>
                <b>
                  {money(rowTotal(row), language)} {isArabic ? "جنيه" : "EGP"}
                </b>
              </div>
            ))}
          </section>
          <section className="csp-client-total">
            <div>
              <p>{isArabic ? "الإجمالي بعد الخصم" : "TOTAL AFTER DISCOUNT"}</p>
              <strong key={clientTotal}>
                {money(clientTotal, language)} <small>{isArabic ? "جنيه" : "EGP"}</small>
              </strong>
              <span>
                {isArabic
                  ? `${depositPercent}% مقدم · ${duration} · ${revisions} مراجعات · العرض صالح لمدة 14 يومًا`
                  : `${depositPercent}% deposit · ${duration} · ${revisions} revisions · valid for 14 days`}
              </span>
            </div>
            <div className="csp-client-actions">
              <button type="button" onClick={() => setChangeRequested(true)}>
                {isArabic ? "طلب تعديل" : "Request a change"}
              </button>
              <button type="button" className="is-primary" onClick={() => setAcceptOpen(true)}>
                <Check size={17} />
                {isArabic ? "مراجعة وقبول" : "Review & accept"}
              </button>
            </div>
          </section>
          {changeRequested && (
            <p className="csp-client-status" role="status">
              <Check />
              {isArabic
                ? "تم تسجيل طلب التعديل في النموذج التجريبي."
                : "Change request recorded in the prototype."}
            </p>
          )}
        </main>
        <div className="csp-mobile-accept-bar">
          <span>
            {isArabic ? "الإجمالي" : "Total"}
            <strong>
              {money(clientTotal, language)} {isArabic ? "جنيه" : "EGP"}
            </strong>
          </span>
          <button type="button" onClick={() => setAcceptOpen(true)}>
            {isArabic ? "مراجعة وقبول" : "Review & accept"}
          </button>
        </div>
        {acceptOpen && (
          <div className="csp-modal-backdrop">
            <div
              className="csp-modal csp-accept-modal"
              role="dialog"
              aria-modal="true"
              aria-label={isArabic ? "راجع قبل القبول" : "Review before accepting"}
            >
              <div className="csp-drawer-head">
                <div>
                  <p className="csp-kicker">QUOTE / ACCEPTANCE</p>
                  <h2>{isArabic ? "راجع قبل القبول" : "Review before accepting"}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setAcceptOpen(false)}
                  aria-label={isArabic ? "إغلاق تأكيد القبول" : "Close acceptance review"}
                >
                  <X />
                </button>
              </div>
              <div className="csp-accept-summary">
                <span>
                  {quoteReferenceLabel} · VERSION {quoteVersionLabel}
                </span>
                <strong>
                  {money(clientTotal, language)} {isArabic ? "جنيه" : "EGP"}
                </strong>
                <p>
                  {isArabic
                    ? `${selectedRows.length} بنود · ${depositPercent}% مقدم · ${duration}`
                    : `${selectedRows.length} items · ${depositPercent}% deposit · ${duration}`}
                </p>
              </div>
              <label className="csp-switch">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                />
                <span>
                  {isArabic
                    ? "قرأت نطاق العمل والشروط وأوافق على هذا العرض."
                    : "I have reviewed the scope and terms and accept this quote."}
                </span>
              </label>
              <button
                type="button"
                className="csp-button csp-button--primary csp-button--block"
                disabled={!acceptedTerms}
                onClick={() => {
                  setAccepted(true);
                  setAcceptOpen(false);
                }}
              >
                {isArabic ? "تأكيد قبول العرض" : "Confirm acceptance"}
              </button>
            </div>
          </div>
        )}
        {accepted && (
          <div className="csp-accepted-banner" role="status">
            <Check />
            <strong>{isArabic ? "تم قبول العرض التجريبي" : "Prototype quote accepted"}</strong>
            <button type="button" onClick={() => setAccepted(false)}>
              {isArabic ? "إغلاق" : "Close"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="csp-view-enter">
      <header className="csp-page-head">
        <div>
          <p className="csp-kicker">QUOTE / NEW FROM BRIEF</p>
          <h1>{isArabic ? "إنشاء عرض سعر" : "QUOTE BUILDER"}</h1>
          <p className="csp-page-description">
            {isArabic
              ? "كوّن النطاق، راقب الهامش، ثم راجع العرض قبل إرساله."
              : "Build the scope, protect the margin, then review before sending."}
          </p>
          <span className={`csp-save-state ${saveState === "dirty" ? "is-dirty" : ""}`}>
            {saveStateLabel}
          </span>
          {quoteRecord && (
            <span className="csp-quote-reference">
              {quoteRecord.reference} · V{quoteRecord.version}
            </span>
          )}
          {saveError && (
            <p className="csp-warning" role="alert">
              {saveError}
            </p>
          )}
        </div>
        <div className="csp-head-actions">
          <button
            type="button"
            className="csp-button"
            onClick={saveDraft}
            disabled={saveState === "saving" || quoteRecord?.status === "accepted"}
          >
            <Save size={16} />
            {isArabic ? "حفظ المسودة" : "Save draft"}
          </button>
          <button type="button" className="csp-button" onClick={() => setPreview(true)}>
            <Eye size={16} />
            {isArabic ? "معاينة كعميل" : "Preview as client"}
          </button>
          <button
            type="button"
            className="csp-button csp-button--primary"
            onClick={() => setSendOpen(true)}
            disabled={quoteRecord?.status === "accepted"}
          >
            <Send size={16} />
            {isArabic ? "إرسال العرض" : "Send quote"}
          </button>
          {storageMode === "local" && quoteRecord && (
            <button
              type="button"
              className="csp-button"
              onClick={() => {
                try {
                  removeDraft(storageKey);
                  skipBackup.current = true;
                } catch {
                  setSaveError(
                    isArabic ? "تعذر مسح الحفظ المحلي." : "Could not clear the device backup.",
                  );
                  return;
                }
                logAudit("quote_cleared", quoteRecord?.reference || "QT-LOCAL-DRAFT");
                setQuoteRecord(null);
                setSaveState("draft");
              }}
            >
              <Trash2 size={16} />
              {isArabic ? "مسح الحفظ المحلي" : "Clear local save"}
            </button>
          )}
        </div>
      </header>
      <p role="status">
        {localSavedAt
          ? `${isArabic ? "نسخة تلقائية على الجهاز" : "Device backup"} · ${shortTime(localSavedAt)}`
          : isArabic
            ? "لم تُحفظ نسخة على الجهاز بعد"
            : "No device backup yet"}
      </p>
      {revisionRequest && (
        <section
          className="csp-warning"
          aria-label={isArabic ? "طلب تعديل العميل" : "Client revision request"}
        >
          <strong>{isArabic ? "طلب تعديل العميل" : "Client revision request"}</strong>
          <p>{revisionRequest.message}</p>
          <small>{shortTime(revisionRequest.created_at)}</small>
        </section>
      )}
      {quoteRecord?.status === "accepted" && (
        <p role="status">
          {isArabic
            ? "هذا العرض مقبول ومحفوظ. أنشئ عرضًا جديدًا لأي تغيير في النطاق."
            : "This accepted quote is locked. Create a new quote for scope changes."}
        </p>
      )}
      {storageMode === "cloud" && quoteRecord && (
        <label className="csp-warning">
          <input
            type="checkbox"
            checked={Boolean(quoteRecord.isTest)}
            disabled={testModeBusy}
            onChange={async (event) => {
              const isTest = event.target.checked;
              setTestModeBusy(true);
              try {
                await studioRequest(`/api/studio/quotes/${quoteRecord.id}/test-mode`, {
                  method: "PATCH",
                  body: JSON.stringify({ isTest }),
                });
                setQuoteRecord((current) => ({ ...current, isTest }));
                onQuoteSaved?.({ ...quoteRecord, isTest });
              } catch (error) {
                setSaveError(error.message);
              } finally {
                setTestModeBusy(false);
              }
            }}
          />
          {isArabic
            ? "بيانات اختبار — استبعاد من التقارير وتذكيرات الدفع (يشمل الطلب المرتبط)"
            : "Test data — exclude from reports and payment reminders (includes linked brief)"}
        </label>
      )}
      <fieldset disabled={quoteRecord?.status === "accepted"} style={{ display: "contents" }}>
        <section className="csp-form-grid">
          <label>
            {isArabic ? "اسم العميل" : "Client name"}
            <input
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                markDirty();
              }}
            />
          </label>
          <label>
            {isArabic ? "اسم المشروع" : "Project name"}
            <input
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                markDirty();
              }}
            />
          </label>
        </section>
        <section className="csp-lead-strip">
          <div>
            <span>{linkedLead?.reference_code || "—"}</span>
            <strong>
              {linkedLead?.name || clientName || "—"} · {linkedLead?.project || projectName || "—"}
            </strong>
          </div>
          <div>
            <span>{isArabic ? "الميزانية" : "BUDGET"}</span>
            <strong>{briefLabel(linkedLead?.budget, language)}</strong>
          </div>
          <div>
            <span>{isArabic ? "المدة" : "TIMELINE"}</span>
            <strong>{briefLabel(linkedLead?.launch_timeline, language)}</strong>
          </div>
        </section>
        {costsPending && (
          <p className="csp-warning" role="status">
            {isArabic
              ? "التكلفة الداخلية غير محددة لبعض البنود. أدخلها قبل الحفظ؛ الهامش الحالي ليس تقديرًا معتمدًا."
              : "Some internal costs are unknown. Enter them before saving; the current margin is not a reliable estimate."}
          </p>
        )}
        <div className="csp-quote-grid">
          <section className="csp-panel">
            <div className="csp-panel-head">
              <h2>
                {quoteReferenceLabel} · V{quoteVersionLabel}
              </h2>
              <StatusChip>
                {
                  {
                    draft: isArabic ? "مسودة" : "DRAFT",
                    sent: isArabic ? "مُرسل" : "SENT",
                    viewed: isArabic ? "تمت المشاهدة" : "VIEWED",
                    revision_requested: isArabic ? "مطلوب تعديل" : "REVISION REQUESTED",
                    accepted: isArabic ? "مقبول" : "ACCEPTED",
                  }[quoteRecord?.status || "draft"]
                }
              </StatusChip>
            </div>
            {items.map((row, index) => (
              <div className="csp-quote-row" key={row.rowId}>
                <div className="csp-quote-row-main">
                  <input
                    className="csp-line-name"
                    value={row.name[language]}
                    onChange={(event) =>
                      updateRow(row.rowId, {
                        name: { ...row.name, [language]: event.target.value },
                      })
                    }
                    aria-label={isArabic ? "اسم البند" : "Item name"}
                  />
                  <textarea
                    value={row.description[language]}
                    onChange={(event) =>
                      updateRow(row.rowId, {
                        description: { ...row.description, [language]: event.target.value },
                      })
                    }
                    aria-label={isArabic ? "وصف البند" : "Item description"}
                    rows={2}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={row.optional}
                      onChange={(event) => updateRow(row.rowId, { optional: event.target.checked })}
                    />
                    {isArabic ? "إضافة اختيارية للعميل" : "Optional client add-on"}
                  </label>
                </div>
                <label className="csp-compact-field">
                  <span>{isArabic ? "الكمية" : "Qty"}</span>
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(event) =>
                      updateRow(row.rowId, { quantity: Math.max(1, Number(event.target.value)) })
                    }
                  />
                </label>
                <label className="csp-compact-field">
                  <span>{isArabic ? "سعر الوحدة" : "Unit price"}</span>
                  <input
                    type="number"
                    min="0"
                    value={row.unitPrice}
                    onChange={(event) =>
                      updateRow(row.rowId, { unitPrice: Math.max(0, Number(event.target.value)) })
                    }
                  />
                </label>
                <label className="csp-compact-field">
                  <span>{isArabic ? "خصم البند" : "Item discount"}</span>
                  <input
                    type="number"
                    min="0"
                    value={row.discount}
                    onChange={(event) =>
                      updateRow(row.rowId, { discount: Math.max(0, Number(event.target.value)) })
                    }
                  />
                </label>
                <div className="csp-line-total">
                  <span>{isArabic ? "الإجمالي" : "Total"}</span>
                  <b>
                    {money(rowTotal(row), language)} {isArabic ? "جنيه" : "EGP"}
                  </b>
                </div>
                <label className="csp-compact-field csp-internal-cost">
                  <span>{isArabic ? "تكلفة الوحدة الداخلية" : "Internal unit cost"}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.cost ?? ""}
                    onChange={(event) =>
                      updateRow(row.rowId, {
                        cost:
                          event.target.value === ""
                            ? null
                            : Math.max(0, Number(event.target.value)),
                        costPending: event.target.value === "",
                      })
                    }
                  />
                </label>
                <div className="csp-row-actions">
                  <button
                    type="button"
                    onClick={() => moveRow(index, -1)}
                    disabled={index === 0}
                    aria-label={isArabic ? `تحريك ${row.name.ar} لأعلى` : `Move ${row.name.en} up`}
                  >
                    <ArrowUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRow(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label={
                      isArabic ? `تحريك ${row.name.ar} لأسفل` : `Move ${row.name.en} down`
                    }
                  >
                    <ArrowDown />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRow(row.rowId)}
                    aria-label={isArabic ? `حذف ${row.name.ar}` : `Remove ${row.name.en}`}
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
            {!items.length && (
              <div className="csp-empty-state">
                <Package />
                <strong>{isArabic ? "العرض بلا بنود" : "This quote has no items"}</strong>
                <span>
                  {isArabic
                    ? "أضف باقة أو بندًا مخصصًا للبدء."
                    : "Add a package or custom item to begin."}
                </span>
              </div>
            )}
            <div className="csp-add-item">
              <select
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value) addItem(event.target.value);
                  event.target.value = "";
                }}
              >
                <option value="" disabled>
                  {isArabic ? "+ إضافة من قائمة الأسعار" : "+ Add from price list"}
                </option>
                {catalog
                  .filter((item) => item.status !== "archived")
                  .map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name[language]} · {money(item.price, language)}
                      {item.status === "draft"
                        ? isArabic
                          ? " · سعر غير معتمد"
                          : " · Unreviewed price"
                        : ""}
                    </option>
                  ))}
              </select>
              <button type="button" className="csp-button" onClick={addCustomItem}>
                <Plus size={15} />
                {isArabic ? "بند مخصص" : "Custom item"}
              </button>
            </div>
          </section>
          <aside>
            <div className="csp-panel csp-commercial-summary">
              <div className="csp-panel-head">
                <h2>{isArabic ? "الملخص التجاري" : "Commercial summary"}</h2>
                <CircleDollarSign size={18} />
              </div>
              <label>
                <span>{isArabic ? "كود الخصم" : "Promo code"}</span>
                <div className="csp-promo-input">
                  <input
                    value={promoInput}
                    onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                  />
                  <button type="button" onClick={applyPromo}>
                    {isArabic ? "تطبيق" : "Apply"}
                  </button>
                </div>
              </label>
              {promoMessage && (
                <p className={`csp-promo-message is-${promoMessage.type}`} role="status">
                  {promoMessage.type === "success" ? <Check /> : <X />}
                  {promoMessageLabel}
                  {promoMessage.type === "success" && discount > 0
                    ? ` ${isArabic ? "وفرت" : "Saved"} ${money(discount, language)} ${isArabic ? "جنيه" : "EGP"}.`
                    : ""}
                </p>
              )}
              <div className="csp-quote-settings">
                <label>
                  <span>{isArabic ? "الضريبة %" : "Tax %"}</span>
                  <input
                    type="number"
                    min="0"
                    value={taxPercent}
                    onChange={(event) => {
                      setTaxPercent(Number(event.target.value));
                      markDirty();
                    }}
                  />
                </label>
                <label>
                  <span>{isArabic ? "المقدم %" : "Deposit %"}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={depositPercent}
                    onChange={(event) => {
                      setDepositPercent(Number(event.target.value));
                      markDirty();
                    }}
                  />
                </label>
                <label>
                  <span>{isArabic ? "مدة التنفيذ" : "Timeline"}</span>
                  <input
                    value={duration}
                    onChange={(event) => {
                      setDuration(event.target.value);
                      markDirty();
                    }}
                  />
                </label>
                <label>
                  <span>{isArabic ? "المراجعات" : "Revisions"}</span>
                  <input
                    type="number"
                    min="0"
                    value={revisions}
                    onChange={(event) => {
                      setRevisions(Number(event.target.value));
                      markDirty();
                    }}
                  />
                </label>
              </div>
              <dl>
                <div>
                  <dt>{isArabic ? "الإجمالي" : "Subtotal"}</dt>
                  <dd>
                    {money(subtotal, language)} {isArabic ? "جنيه" : "EGP"}
                  </dd>
                </div>
                <div>
                  <dt>{isArabic ? "الخصم" : "Discount"}</dt>
                  <dd>
                    −{money(discount, language)} {isArabic ? "جنيه" : "EGP"}
                  </dd>
                </div>
                <div>
                  <dt>{isArabic ? "الضريبة" : "Tax"}</dt>
                  <dd>
                    {money(tax, language)} {isArabic ? "جنيه" : "EGP"}
                  </dd>
                </div>
                <div>
                  <dt>{isArabic ? "التكلفة الداخلية" : "Internal cost"}</dt>
                  <dd>
                    {money(cost, language)} {isArabic ? "جنيه" : "EGP"}
                  </dd>
                </div>
                <div>
                  <dt>{isArabic ? "الهامش المتوقع" : "Expected margin"}</dt>
                  <dd className={quoteMargin < 30 ? "is-warning" : ""}>
                    {costsPending ? "—" : `${quoteMargin}%`}
                  </dd>
                </div>
                <div className="is-total">
                  <dt>{isArabic ? "إجمالي العميل" : "Client total"}</dt>
                  <dd>
                    {money(total, language)} {isArabic ? "جنيه" : "EGP"}
                  </dd>
                </div>
              </dl>
              {!costsPending && quoteMargin < 30 && (
                <p className="csp-warning">
                  {isArabic
                    ? "هامش الربح أقل من الحد الموصى به."
                    : "Margin is below the recommended floor."}
                </p>
              )}
              <button
                type="button"
                className="csp-button csp-button--primary csp-button--block"
                onClick={() => setPreview(true)}
              >
                <Eye size={16} />
                {isArabic ? "معاينة العرض كعميل" : "Preview as client"}
              </button>
            </div>
            <div className="csp-telegram-preview">
              <div>
                <MessageCircle size={18} />
                <span>TELEGRAM / PREVIEW</span>
              </div>
              <strong>{isArabic ? "عرض جديد جاهز للمراجعة" : "New quote ready for review"}</strong>
              <p>
                {quoteReferenceLabel} · {money(total, language)} {isArabic ? "جنيه" : "EGP"}
              </p>
            </div>
          </aside>
        </div>
      </fieldset>
      {sendOpen && (
        <div className="csp-modal-backdrop">
          <div
            className="csp-modal"
            role="dialog"
            aria-modal="true"
            aria-label={isArabic ? "إصدار رابط العميل" : "Issue client link"}
          >
            <div className="csp-drawer-head">
              <div>
                <p className="csp-kicker">QUOTE / SEND</p>
                <h2>{isArabic ? "إصدار رابط العميل" : "Issue client link"}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSendOpen(false)}
                aria-label={isArabic ? "إغلاق إرسال العرض" : "Close send quote"}
              >
                <X />
              </button>
            </div>
            <p className="csp-modal-copy">
              {storageMode === "cloud"
                ? isArabic
                  ? "سيتم حفظ أحدث إصدار وإصدار رابط آمن صالح لمدة 14 يومًا."
                  : "The latest version will be saved and a secure 14-day link will be issued."
                : isArabic
                  ? "أنت في الوضع المحلي التجريبي؛ لن يصدر رابط حقيقي."
                  : "Local demo mode is active; no real link will be issued."}
            </p>
            <div className="csp-channel-grid">
              {[
                ["copy", isArabic ? "نسخ الرابط" : "Copy link"],
                ["whatsapp", "WhatsApp"],
                ["email", "Email"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={sendChannel === value ? "is-selected" : ""}
                  onClick={() => setSendChannel(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="csp-button csp-button--primary csp-button--block"
              onClick={sendQuote}
              disabled={saveState === "saving" || sendBusy}
            >
              <Send />
              {isArabic ? "حفظ وإصدار الرابط" : "Save & issue link"}
            </button>
          </div>
        </div>
      )}
      {sent && (
        <p className="csp-floating-status" role="status">
          <Check />
          {sent.clientUrl
            ? isArabic
              ? "تم إصدار رابط العميل الآمن."
              : "Secure client link issued."
            : isArabic
              ? "تمت المحاكاة محليًا."
              : "Local simulation completed."}
          {sent.clientUrl && (
            <a href={sent.clientUrl} target="_blank" rel="noreferrer">
              {isArabic ? "فتح العرض" : "Open quote"}
            </a>
          )}
          <button type="button" onClick={() => setSent(null)}>
            {isArabic ? "إغلاق" : "Close"}
          </button>
        </p>
      )}
    </div>
  );
}
