import { useSearchParams } from "react-router-dom";
import { confirmLeave } from "./studio/unsaved";
import { readDrafts } from "./studio/drafts";
import { leadForDraft, visibleQuoteDrafts } from "./studio/briefs";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgePercent,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import {} from "../data/commercialStudioPrototype";

import { NAVIGATION, NAV_GROUPS, money, shortTime } from "./studio/shared";
import ControlView from "./studio/ControlView";
import CatalogView from "./studio/CatalogView";
import LeadsView from "./studio/LeadsView";
import QuoteView from "./studio/QuoteView";
import PromotionsView from "./studio/PromotionsView";
import SettingsView from "./studio/SettingsView";
import ProjectsView from "./studio/ProjectsView";
import PaymentsView from "./studio/PaymentsView";
import ReportsView from "./studio/ReportsView";
import PlaceholderView from "./studio/PlaceholderView";
import SectionBoundary from "./studio/SectionBoundary";
import "./commercialStudioPrototype.css";
import "./studio/studioLayout.css";
import { useStudioData } from "./studio/useStudioData";
import { workflowState } from "./studio/workflow";
import ZoomixLogo from "../components/ZoomixLogo";

const QUOTE_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "revision_requested",
  "accepted",
  "cancelled",
  "expired",
];

const quoteStatusLabel = (status, isArabic) =>
  ({
    draft: isArabic ? "مسودة" : "Draft",
    sent: isArabic ? "مُرسل" : "Sent",
    viewed: isArabic ? "تمت المشاهدة" : "Viewed",
    revision_requested: isArabic ? "مطلوب تعديل" : "Revision requested",
    accepted: isArabic ? "مقبول" : "Accepted",
    cancelled: isArabic ? "ملغي" : "Cancelled",
    expired: isArabic ? "منتهي" : "Expired",
    "local-draft": isArabic ? "مسودة غير محفوظة" : "Unsaved draft",
  })[status] || status;

const quoteValueRange = (value, isArabic) =>
  ({
    all: isArabic ? "كل القيم" : "All values",
    under_5000: isArabic ? "أقل من 5,000" : "Under 5,000",
    from_5000_to_10000: isArabic ? "5,000–10,000" : "5,000–10,000",
    from_10000_to_15000: isArabic ? "10,000–15,000" : "10,000–15,000",
    over_15000: isArabic ? "أكثر من 15,000" : "Over 15,000",
  })[value];

const quoteMatchesValueRange = (total, range) => {
  if (range === "all") return true;
  if (!Number.isFinite(total)) return false;
  if (range === "under_5000") return total < 5000;
  if (range === "from_5000_to_10000") return total >= 5000 && total <= 10000;
  if (range === "from_10000_to_15000") return total > 10000 && total <= 15000;
  return total > 15000;
};

const quotePriorityScore = (status) =>
  ({
    revision_requested: 5,
    viewed: 4,
    sent: 3,
    draft: 2,
    "local-draft": 2,
    accepted: 1,
    expired: 0,
    cancelled: 0,
  })[status] ?? 0;

const quoteNextAction = (status, isArabic) =>
  ({
    revision_requested: isArabic ? "راجع طلب التعديل" : "Review requested changes",
    viewed: isArabic ? "تابع مع العميل" : "Follow up with client",
    sent: isArabic ? "راجع العرض المرسل" : "Review sent quote",
    draft: isArabic ? "أكمل تجهيز العرض" : "Finish the draft",
    "local-draft": isArabic ? "راجع المسودة" : "Review draft",
    accepted: isArabic ? "جاهز للانتقال إلى المشروع" : "Ready for project handoff",
    expired: isArabic ? "راجع العرض المنتهي" : "Review expired quote",
    cancelled: isArabic ? "راجع السجل" : "Review record",
  })[status] || (isArabic ? "افتح العرض" : "Open quote");

const quoteSortLabel = (value, isArabic) =>
  ({
    priority: isArabic ? "الأولوية العملية" : "Work priority",
    recent: isArabic ? "آخر تحديث" : "Recently updated",
    value: isArabic ? "القيمة الأعلى" : "Highest value",
    version: isArabic ? "الإصدار" : "Version",
  })[value];

const QUOTE_PREFERENCES_KEY = "zoomix-quote-preferences";
const QUOTE_PAGE_SIZE = 5;

const readQuotePreferences = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(QUOTE_PREFERENCES_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

function QuoteList({
  language,
  quotes = [],
  draftRows = [],
  selectedQuoteId,
  onOpenQuote,
  projects = [],
  payments = [],
  onOpenProject,
  onOpenPayment,
}) {
  const isArabic = language === "ar";
  const [quotePreferences] = useState(readQuotePreferences);
  const [query, setQuery] = useState(() => quotePreferences.query || "");
  const [status, setStatus] = useState(() => quotePreferences.status || "all");
  const [valueRange, setValueRange] = useState(() => quotePreferences.valueRange || "all");
  const [version, setVersion] = useState(() => quotePreferences.version || "all");
  const [sortBy, setSortBy] = useState(() => quotePreferences.sortBy || "priority");
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionId, setOpenActionId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState("");
  const feedbackTimer = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        QUOTE_PREFERENCES_KEY,
        JSON.stringify({ query, status, valueRange, version, sortBy }),
      );
    } catch {
      // Preferences are a convenience; a blocked localStorage must not affect the list.
    }
  }, [query, sortBy, status, valueRange, version]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, sortBy, status, valueRange, version]);

  useEffect(
    () => () => {
      if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    },
    [],
  );

  const records = useMemo(
    () => [
      ...(quotes || []).map((row) => ({
        ...row,
        kind: "quote",
        status: row.status || "draft",
        version: Number(row.version || 0),
        total: Number.isFinite(Number(row.total)) ? Number(row.total) : null,
        searchText: [
          row.reference,
          row.clientName,
          row.projectName,
          row.lastEvent,
        ]
          .filter(Boolean)
          .join(" "),
      })),
      ...visibleQuoteDrafts(draftRows, quotes || []).map(([id, row]) => ({
        ...row,
        id,
        kind: "local-draft",
        status: "local-draft",
        version: Number(row.record?.version || row.version || 0),
        total: Number.isFinite(Number(row.total)) ? Number(row.total) : null,
        searchText: [
          row.record?.reference,
          row.clientName,
          row.projectName,
          row.record?.projectName,
          row.record?.lastEvent,
        ]
          .filter(Boolean)
          .join(" "),
      })),
    ].filter((row) => !row.isTest),
    [draftRows, quotes],
  );

  const workflowForQuote = (row) => {
    const linkedProject = row?.kind !== "local-draft"
      ? projects.find((project) => String(project.quoteId) === String(row.id))
      : null;
    const linkedPayments = linkedProject
      ? payments.filter((payment) => String(payment.projectId) === String(linkedProject.id))
      : [];
    return workflowState({ quote: row, project: linkedProject, payments: linkedPayments }, isArabic);
  };

  const versions = useMemo(
    () =>
      [...new Set(records.map((row) => row.version).filter((value) => value > 0))].sort(
        (a, b) => a - b,
      ),
    [isArabic, payments, projects, records],
  );

  const quoteSummary = useMemo(() => {
    const draftCount = records.filter((row) => ["draft", "local-draft"].includes(row.status)).length;
    const attentionCount = records.filter((row) =>
      ["sent", "viewed", "revision_requested"].includes(row.status),
    ).length;
    const acceptedCount = records.filter((row) => row.status === "accepted").length;
    const totalValue = records.reduce((sum, row) => sum + (row.total || 0), 0);
    const attentionValue = records
      .filter((row) => ["sent", "viewed", "revision_requested"].includes(row.status))
      .reduce((sum, row) => sum + (row.total || 0), 0);
    const acceptedValue = records
      .filter((row) => row.status === "accepted")
      .reduce((sum, row) => sum + (row.total || 0), 0);
    return [
      {
        key: "total",
        label: isArabic ? "إجمالي العروض" : "Total quotes",
        count: records.length,
        note: `${money(totalValue)} ${isArabic ? "جنيه قيمة إجمالية" : "EGP total value"}`,
      },
      {
        key: "drafts",
        label: isArabic ? "المسودات" : "Drafts",
        count: draftCount,
        note: isArabic ? "جاهزة للمراجعة" : "Ready for review",
      },
      {
        key: "attention",
        label: isArabic ? "تحتاج متابعة" : "Needs attention",
        count: attentionCount,
        note: `${money(attentionValue)} ${isArabic ? "جنيه قيد المتابعة" : "EGP in follow-up"}`,
      },
      {
        key: "accepted",
        label: isArabic ? "مقبولة" : "Accepted",
        count: acceptedCount,
        note: `${money(acceptedValue)} ${isArabic ? "جنيه مؤكدة" : "EGP confirmed"}`,
      },
    ];
  }, [isArabic, records]);

  const priorityRecord = useMemo(
    () =>
      [...records]
        .filter((row) => !["accepted", "cancelled", "expired"].includes(row.status))
        .sort((a, b) => {
          const score = quotePriorityScore(b.status) - quotePriorityScore(a.status);
          if (score) return score;
          return new Date(b.updatedAt || b.lastEventAt || b.createdAt || 0) - new Date(a.updatedAt || a.lastEventAt || a.createdAt || 0);
        })[0] || null,
    [records],
  );

  const quickFilters = [
    { value: "all", label: isArabic ? "كل العروض" : "All quotes", count: records.length },
    {
      value: "draft",
      label: isArabic ? "المسودات" : "Drafts",
      count: records.filter((row) => ["draft", "local-draft"].includes(row.status)).length,
    },
    {
      value: "sent",
      label: isArabic ? "مُرسلة" : "Sent",
      count: records.filter((row) => row.status === "sent").length,
    },
    {
      value: "viewed",
      label: isArabic ? "تمت المشاهدة" : "Viewed",
      count: records.filter((row) => row.status === "viewed").length,
    },
    {
      value: "revision_requested",
      label: isArabic ? "مطلوب تعديل" : "Changes requested",
      count: records.filter((row) => row.status === "revision_requested").length,
    },
    {
      value: "accepted",
      label: isArabic ? "مقبولة" : "Accepted",
      count: records.filter((row) => row.status === "accepted").length,
    },
  ];

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const rows = records.filter((row) => {
      const matchesQuery =
        !normalizedQuery || row.searchText.toLocaleLowerCase().includes(normalizedQuery);
      const matchesStatus =
        status === "all" ||
        (status === "draft" ? ["draft", "local-draft"].includes(row.status) : row.status === status);
      const matchesRange = quoteMatchesValueRange(row.total, valueRange);
      const matchesVersion = version === "all" || String(row.version) === version;
      return matchesQuery && matchesStatus && matchesRange && matchesVersion;
    });
    return rows.sort((a, b) => {
      if (sortBy === "value") return (b.total || 0) - (a.total || 0);
      if (sortBy === "version") return (b.version || 0) - (a.version || 0);
      if (sortBy === "recent") {
        return new Date(b.updatedAt || b.lastEventAt || b.createdAt || 0) - new Date(a.updatedAt || a.lastEventAt || a.createdAt || 0);
      }
      const priority = quotePriorityScore(b.status) - quotePriorityScore(a.status);
      if (priority) return priority;
      return new Date(b.updatedAt || b.lastEventAt || b.createdAt || 0) - new Date(a.updatedAt || a.lastEventAt || a.createdAt || 0);
    });
  }, [query, records, sortBy, status, valueRange, version]);

  const hasFilters =
    Boolean(query.trim()) ||
    status !== "all" ||
    valueRange !== "all" ||
    version !== "all";
  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setValueRange("all");
    setVersion("all");
    setSortBy("priority");
  };
  const totalPages = Math.max(1, Math.ceil(filtered.length / QUOTE_PAGE_SIZE));
  const pageRows = filtered.slice((currentPage - 1) * QUOTE_PAGE_SIZE, currentPage * QUOTE_PAGE_SIZE);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const announceAction = (message) => {
    setActionFeedback(message);
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setActionFeedback(""), 5000);
  };

  const copyQuoteLink = (row) => {
    const internalLink = `${window.location.origin}/studio?view=quotes&record=${encodeURIComponent(row.id)}`;
    const link = row.clientUrl || internalLink;
    setOpenActionId(null);
    let copied = false;
    try {
      const field = document.createElement("textarea");
      field.value = link;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      copied = document.execCommand("copy");
      field.remove();
    } catch {
      copied = false;
    }
    announceAction(
      copied
        ? row.clientUrl
          ? isArabic
            ? "تم نسخ رابط العميل الآمن."
            : "Secure client link copied."
          : isArabic
            ? "تم نسخ رابط تفاصيل العرض داخل الاستوديو."
            : "Studio quote details link copied."
        : isArabic
          ? "تم تجهيز رابط التفاصيل، لكن تعذر النسخ التلقائي."
          : "The details link is ready, but automatic copying failed.",
    );
  };

  const openQuote = (row, action = "open") => {
    const isLocal = row.kind === "local-draft";
    setOpenActionId(null);
    onOpenQuote(isLocal ? null : row.id, isLocal ? row.id : null, action);
  };

  return (
    <section
      className="csp-draft-list csp-quote-list csp-quote-list--workspace"
      aria-labelledby="quote-list-title"
    >
      <div className="csp-quote-list-head">
        <div className="csp-quote-list-head-copy">
          <p className="csp-kicker">COMMERCIAL / QUOTES</p>
          <h2 id="quote-list-title">{isArabic ? "العروض والمسودات" : "Quotes and drafts"}</h2>
          <p className="csp-quote-list-description">
            {isArabic
              ? "كل عرض يبدأ كنطاق واضح، ثم يمر بالمراجعة قبل أن يصل إلى العميل."
              : "Every quote starts as a clear scope, then moves through review before it reaches the client."}
          </p>
        </div>
        <div className="csp-quote-list-head-side">
          <div className="csp-quote-list-priority">
            <span>{isArabic ? "الخطوة التالية" : "NEXT UP"}</span>
            <strong>
              {priorityRecord
                ? workflowForQuote(priorityRecord).next.label
                : isArabic
                  ? "كل العروض تحت السيطرة"
                  : "Everything is under control"}
            </strong>
            <small>
              {priorityRecord
                ? `${priorityRecord.reference || (isArabic ? "عرض بلا مرجع" : "Unreferenced quote")} · ${money(priorityRecord.total)} ${isArabic ? "جنيه" : "EGP"}`
                : isArabic
                  ? "لا توجد خطوة عاجلة"
                  : "No urgent action"}
            </small>
          </div>
          <span className="csp-quote-list-count">
            {filtered.length} / {records.length} {isArabic ? "عرض" : "quotes"}
          </span>
        </div>
      </div>
      <div className="csp-quote-summary" aria-label={isArabic ? "ملخص العروض" : "Quote summary"}>
        {quoteSummary.map((item) => (
          <div className={`csp-quote-summary-card csp-quote-summary-card--${item.key}`} key={item.key}>
            <span>{item.label}</span>
            <strong>{item.count}</strong>
            <small>{item.note}</small>
          </div>
        ))}
      </div>
      <div
        className="csp-quote-quick-filters"
        role="group"
        aria-label={isArabic ? "فلاتر حالة سريعة" : "Quick status filters"}
      >
        {quickFilters.map((filter) => (
          <button
            type="button"
            key={filter.value}
            className={status === filter.value ? "is-active" : ""}
            aria-pressed={status === filter.value}
            onClick={() => setStatus(filter.value)}
          >
            <span>{filter.label}</span>
            <b>{filter.count}</b>
          </button>
        ))}
      </div>
      <div className="csp-quote-filters-panel">
        <div className="csp-quote-filters-head">
          <div>
            <span className="csp-kicker">FIND / REFINE</span>
            <strong>{isArabic ? "ابحث في العروض" : "Find a quote"}</strong>
          </div>
          <small>
            {isArabic ? "النتائج الظاهرة الآن" : "Showing now"} · {filtered.length}
          </small>
        </div>
        <div className="csp-quote-list-toolbar">
          <label className="csp-quote-search">
            <Search size={16} aria-hidden="true" />
            <span className="csp-sr-only">{isArabic ? "بحث في العروض" : "Search quotes"}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                isArabic ? "ابحث بالمرجع أو العميل أو المشروع" : "Search reference, client or project"
              }
            />
          </label>
          <label>
            <span>{isArabic ? "الحالة" : "Status"}</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">{isArabic ? "كل الحالات" : "All statuses"}</option>
              {QUOTE_STATUSES.map((value) => (
                <option value={value} key={value}>
                  {quoteStatusLabel(value, isArabic)}
                </option>
              ))}
              <option value="local-draft">{quoteStatusLabel("local-draft", isArabic)}</option>
            </select>
          </label>
          <label>
            <span>{isArabic ? "نطاق القيمة" : "Value range"}</span>
            <select value={valueRange} onChange={(event) => setValueRange(event.target.value)}>
              {Object.keys({
                all: true,
                under_5000: true,
                from_5000_to_10000: true,
                from_10000_to_15000: true,
                over_15000: true,
              }).map((value) => (
                <option value={value} key={value}>
                  {quoteValueRange(value, isArabic)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{isArabic ? "الإصدار" : "Version"}</span>
            <select value={version} onChange={(event) => setVersion(event.target.value)}>
              <option value="all">{isArabic ? "كل الإصدارات" : "All versions"}</option>
              {versions.map((value) => (
                <option value={value} key={value}>
                  {isArabic ? `الإصدار ${value}` : `Version ${value}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{isArabic ? "ترتيب" : "Sort"}</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {Object.keys({ priority: true, recent: true, value: true, version: true }).map((value) => (
                <option value={value} key={value}>
                  {quoteSortLabel(value, isArabic)}
                </option>
              ))}
            </select>
          </label>
          {hasFilters && (
            <button type="button" className="csp-button" onClick={resetFilters}>
              {isArabic ? "مسح الفلاتر" : "Clear filters"}
            </button>
          )}
        </div>
      </div>
      {filtered.length ? (
        <div className="csp-quote-list-grid">
          {pageRows.map((row) => {
            const isLocal = row.kind === "local-draft";
            const isSelected = !isLocal && String(row.id) === String(selectedQuoteId);
            const reference = isLocal
              ? row.record?.reference || (isArabic ? "مسودة غير محفوظة" : "Unsaved draft")
              : row.reference;
            const openLabel = isArabic ? "فتح العرض" : "Open quote";
            const OpenIcon = isArabic ? ChevronLeft : ChevronRight;
            const nextAction = workflowForQuote(row).next.label;
            const updatedAt = row.updatedAt || row.lastEventAt || row.createdAt;
            const linkedProject = !isLocal
              ? projects.find((project) => String(project.quoteId) === String(row.id))
              : null;
            const linkedPayments = linkedProject
              ? payments.filter((payment) => String(payment.projectId) === String(linkedProject.id))
              : [];
            return (
              <article
                className={`csp-quote-list-row${
                  isLocal
                    ? " csp-quote-list-row--local"
                    : row.status === "revision_requested"
                      ? " csp-quote-list-row--attention"
                      : row.status === "accepted"
                        ? " csp-quote-list-row--accepted"
                        : ""
                }${isSelected ? " is-selected" : ""}`}
                data-status={row.status}
                key={`${row.kind}-${row.id}`}
                aria-label={`${reference || (isArabic ? "عرض بلا مرجع" : "Unreferenced quote")} — ${nextAction}`}
              >
                <button type="button" className="csp-quote-list-row-main" onClick={() => openQuote(row)}>
                  <span className="csp-quote-list-row-reference">
                    <i aria-hidden="true" />
                    <strong>{reference || (isArabic ? "عرض بلا مرجع" : "Unreferenced quote")}</strong>
                  </span>
                  <span className="csp-quote-list-row-client">
                    {row.clientName || (isArabic ? "بدون اسم عميل" : "Unnamed client")}
                  </span>
                  <span className="csp-quote-list-row-project">
                    {row.projectName || (isArabic ? "بدون اسم مشروع" : "Unnamed project")}
                  </span>
                  <span className={`csp-quote-next csp-quote-next--${row.status}`}>
                    <small>{isArabic ? "الخطوة التالية" : "NEXT"}</small>
                    {nextAction}
                  </span>
                </button>
                <span className="csp-quote-list-meta" data-status={row.status}>
                  <span className="csp-quote-status-line">
                    <i aria-hidden="true" />
                    <b>{quoteStatusLabel(row.status, isArabic)}</b>
                  </span>
                  <small className="csp-quote-version">
                    {row.version > 0 ? (isArabic ? `V${row.version}` : `v${row.version}`) : "—"}
                  </small>
                  <small className="csp-quote-updated">
                    {updatedAt ? `${isArabic ? "آخر تحديث" : "Updated"} · ${shortTime(updatedAt)}` : "—"}
                  </small>
                </span>
                <span className="csp-quote-list-total">
                  <small>{isArabic ? "قيمة العرض" : "QUOTE VALUE"}</small>
                  <strong>
                    {row.total == null
                      ? "—"
                      : `${money(row.total, language)} ${isArabic ? "جنيه" : "EGP"}`}
                  </strong>
                </span>
                <div className="csp-quote-list-actions">
                  <button type="button" className="csp-quote-list-open" onClick={() => openQuote(row)}>
                    <span>{isSelected ? (isArabic ? "مفتوح الآن" : "Open now") : openLabel}</span>
                    <OpenIcon size={15} />
                  </button>
                  {linkedProject && (
                    <button
                      type="button"
                      className="csp-quote-list-open csp-quote-list-open--related"
                      onClick={() => onOpenProject?.(linkedProject.id)}
                    >
                      <span>{isArabic ? "المشروع" : "Project"}</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                  {linkedPayments.length > 0 && (
                    <button
                      type="button"
                      className="csp-quote-list-open csp-quote-list-open--related"
                      onClick={() => onOpenPayment?.(linkedPayments[0].id)}
                    >
                      <span>{isArabic ? "الدفعات" : "Payments"}</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                  <div className="csp-quote-actions">
                    <button
                      type="button"
                      className="csp-quote-more"
                      aria-label={isArabic ? "إجراءات العرض" : "Quote actions"}
                      aria-haspopup="menu"
                      aria-expanded={openActionId === `${row.kind}-${row.id}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        const key = `${row.kind}-${row.id}`;
                        setOpenActionId((current) => (current === key ? null : key));
                      }}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                    {openActionId === `${row.kind}-${row.id}` && (
                      <div
                        className="csp-quote-actions-menu"
                        role="menu"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button type="button" role="menuitem" onClick={() => openQuote(row, "preview")}>
                          <Eye size={15} />
                          {isArabic ? "معاينة العرض" : "Preview quote"}
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onMouseDown={() => {
                            setOpenActionId(null);
                            announceAction(
                              isArabic
                                ? "تم تجهيز رابط التفاصيل للنسخ."
                                : "The quote details link is ready to copy.",
                            );
                          }}
                          onClick={() => copyQuoteLink(row)}
                        >
                          <Copy size={15} />
                          {row.clientUrl
                            ? isArabic
                              ? "نسخ رابط العميل"
                              : "Copy client link"
                            : isArabic
                              ? "نسخ رابط التفاصيل"
                              : "Copy details link"}
                        </button>
                        <button type="button" role="menuitem" onClick={() => openQuote(row, "copy")}>
                          <FilePlus2 size={15} />
                          {isArabic ? "إنشاء نسخة جديدة" : "Create a new copy"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="csp-empty-state csp-quote-list-empty" role="status">
          <FileText />
          <strong>{isArabic ? "لا توجد عروض مطابقة" : "No matching quotes"}</strong>
          <span>
            {hasFilters
              ? isArabic
                ? "غيّر البحث أو الفلاتر، أو امسحها لرؤية كل العروض."
                : "Change the search or filters, or clear them to see every quote."
              : isArabic
                ? "لا توجد عروض محفوظة أو مسودات على الجهاز حتى الآن."
                : "There are no saved quotes or device drafts yet."}
          </span>
          {hasFilters && (
            <button type="button" className="csp-button" onClick={resetFilters}>
              {isArabic ? "مسح الفلاتر" : "Clear filters"}
            </button>
          )}
        </div>
      )}
      {filtered.length > QUOTE_PAGE_SIZE && (
        <nav className="csp-quote-pagination" aria-label={isArabic ? "صفحات العروض" : "Quote pages"}>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            {isArabic ? "السابق" : "Previous"}
          </button>
          <span>
            {isArabic ? "صفحة" : "Page"} {currentPage} {isArabic ? "من" : "of"} {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            {isArabic ? "التالي" : "Next"}
          </button>
        </nav>
      )}
      {actionFeedback && (
        <p className="csp-quote-feedback" role="status">
          <Check size={16} />
          {actionFeedback}
        </p>
      )}
    </section>
  );
}

export default function CommercialStudioPrototype({ demo = false }) {
  const [language, setLanguage] = useState("ar");
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(params.get("view") || "control");
  const draftId =
    params.get("draft") || (params.get("record") ? `quote-${params.get("record")}` : "working");
  const selectedQuoteId = page === "quotes" ? params.get("record") : null;
  const quoteDetailOpen = page === "quotes" && Boolean(params.get("record") || params.get("draft"));
  const [selection, setSelection] = useState(params.get("record"));
  const [draftRows, setDraftRows] = useState([]);
  const lastParams = useRef(params.toString());
  useEffect(() => {
    const current = params.toString();
    if (current !== lastParams.current && !confirmLeave()) {
      setParams(lastParams.current, { replace: true });
      return;
    }
    lastParams.current = current;
    setPage(params.get("view") || "control");
    setSelection(params.get("record"));
  }, [params]);
  useEffect(() => {
    try {
      setDraftRows(
        Object.entries(readDrafts())
          .filter(([id, row]) => row.kind === "quote" && id.startsWith(`${storageMode}:`))
          .map(([id, row]) => [id.slice(storageMode.length + 1), row]),
      );
    } catch {}
  }, [page, params]);
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const {
    catalog,
    setCatalog,
    promotions,
    setPromotions,
    storageMode,
    quotes,
    setQuotes,
    requests,
    projects,
    payments,
    setPayments,
    loading,
    error,
    retry,
    lastUpdated,
    refreshError,
  } = useStudioData(demo);
  const selectedLead = leadForDraft(draftId, selectedQuoteId, requests);
  const [quickOpen, setQuickOpen] = useState(false);
  const [flash, setFlash] = useState("");
  const [freshToken, setFreshToken] = useState(0);
  const freshConsumedRef = useRef(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [seenNotifications, setSeenNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("zoomix-notifications-seen") || "[]");
    } catch {
      return [];
    }
  });
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const syncQuote = (quote) => {
    setQuotes((current) =>
      Array.isArray(current)
        ? [
            { ...current.find((item) => item.id === quote.id), ...quote },
            ...current.filter((item) => item.id !== quote.id),
          ]
        : current,
    );
    retry();
  };
  const syncPayment = (payment) =>
    setPayments((current) =>
      Array.isArray(current)
        ? current.map((item) => (item.id === payment.id ? payment : item))
        : current,
    );
  const isArabic = language === "ar";
  const activeNav = useMemo(() => NAVIGATION.find(([id]) => id === page), [page]);
  const searchQuery = globalQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const match = (...values) =>
      values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchQuery),
      );
    const results = [];
    (quotes || []).forEach((quote) => {
      if (match(quote.reference, quote.clientName, quote.projectName))
        results.push({
          key: `quote-${quote.id}`,
          group: isArabic ? "عروض" : "Quotes",
          label: `${quote.reference} · ${quote.clientName || quote.projectName || ""}`,
          target: "quotes",
          recordId: quote.id,
        });
    });
    (requests || []).forEach((request) => {
      if (match(request.name, request.project, request.reference_code, request.service))
        results.push({
          key: `request-${request.id}`,
          group: isArabic ? "طلبات" : "Briefs",
          label: `${request.name} · ${request.project || ""}`,
          target: "leads",
          recordId: request.id,
        });
    });
    (projects || []).forEach((project) => {
      if (match(project.projectName, project.clientName, project.reference))
        results.push({
          key: `project-${project.id}`,
          group: isArabic ? "مشروعات" : "Projects",
          label: `${project.projectName} · ${project.clientName || ""}`,
          target: "projects",
          recordId: project.id,
        });
    });
    (payments || []).forEach((payment) => {
      if (match(payment.projectName, payment.clientName, payment.reference))
        results.push({
          key: `payment-${payment.id}`,
          group: isArabic ? "مدفوعات" : "Payments",
          label: `${payment.projectName || payment.reference} · ${money(payment.amount)} ${isArabic ? "جنيه" : "EGP"}`,
          target: "payments",
          recordId: payment.id,
        });
    });
    catalog.forEach((item) => {
      if (match(item.id, item.name?.ar, item.name?.en))
        results.push({
          key: `catalog-${item.id}`,
          group: isArabic ? "بنود" : "Price list",
          label: `${item.name?.[language] || item.id} · ${money(item.price)}`,
          target: "catalog",
          recordId: item.id,
        });
    });
    return results.slice(0, 8);
  }, [searchQuery, quotes, requests, projects, payments, catalog, isArabic, language]);
  const notifications = useMemo(() => {
    const eventCopy = (event) =>
      ({
        sent: isArabic ? "تم إرسال العرض" : "Quote sent",
        viewed: isArabic ? "شاهد العميل العرض" : "Client viewed the quote",
        revision_requested: isArabic ? "العميل طلب تعديلًا" : "Client requested changes",
        accepted: isArabic ? "قبل العميل العرض" : "Client accepted the quote",
      })[event] || event;
    return (quotes || [])
      .filter((quote) => quote.lastEvent && quote.lastEventAt)
      .map((quote) => ({
        key: `${quote.id}-${quote.lastEvent}-${quote.lastEventAt}`,
        recordId: quote.id,
        title: eventCopy(quote.lastEvent),
        note: `${quote.reference} · ${quote.clientName || quote.projectName || ""}`,
        at: quote.lastEventAt,
      }))
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 8);
  }, [quotes, isArabic]);
  const unreadNotifications = notifications.filter(
    (item) => !seenNotifications.includes(item.key),
  ).length;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 800px)");
    const sync = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMobileNav(false);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!mobileNav) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMobileNav(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileNav]);

  useEffect(() => {
    const openSearch = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", openSearch);
    return () => window.removeEventListener("keydown", openSearch);
  }, []);

  useEffect(() => {
    if (!searchOpen && !notifOpen && !quickOpen) return undefined;
    const closeOnOutside = (event) => {
      if (
        !event.target.closest?.(".csp-global-search") &&
        !event.target.closest?.(".csp-mobile-search-panel") &&
        !event.target.closest?.(".csp-mobile-search-button")
      )
        setSearchOpen(false);
      if (!event.target.closest?.(".csp-notif-wrap")) setNotifOpen(false);
      if (!event.target.closest?.(".csp-quick-wrap")) setQuickOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
        setQuickOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [searchOpen, notifOpen, quickOpen]);

  useEffect(() => {
    if (searchOpen && isMobile) {
      window.requestAnimationFrame(() => mobileSearchRef.current?.focus());
    }
  }, [searchOpen, isMobile]);

  useEffect(() => {
    if (!flash) return undefined;
    const timer = window.setTimeout(() => setFlash(""), 5000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const navigate = (next, recordId = null, nextDraft = null, extraParams = {}) => {
    if (!confirmLeave()) return false;
    lastParams.current = new URLSearchParams({
      view: next,
      ...(recordId ? { record: String(recordId) } : {}),
      ...(nextDraft ? { draft: nextDraft } : {}),
      ...Object.fromEntries(
        Object.entries(extraParams || {}).filter(([, value]) => value !== null && value !== undefined && value !== ""),
      ),
    }).toString();
    setParams(lastParams.current);
    setPage(next);
    setSelection(recordId);
    setMobileNav(false);
    setFlash("");
    window.scrollTo({ top: 0, behavior: "auto" });
    return true;
  };
  const createQuoteFromLead = (lead) => {
    navigate("quotes", null, `lead-${lead.id}`);
  };
  const startNewQuote = () => {
    if (!navigate("quotes", null, `draft-${crypto.randomUUID()}`)) return;
    setFreshToken((value) => value + 1);
    setFlash(
      isArabic
        ? "بدأت عرضًا جديدًا بدون خصم تلقائي."
        : "Started a new quote without an automatic discount.",
    );
  };
  useEffect(() => {
    if (!selection || page === "quotes") return;
    const timer = setTimeout(
      () =>
        (() => {
          document
            .querySelectorAll(".csp-record-highlight")
            .forEach((row) => row.classList.remove("csp-record-highlight"));
          const row = document.getElementById(`studio-record-${selection}`);
          row?.classList.add("csp-record-highlight");
          row?.scrollIntoView({ block: "center" });
        })(),
      0,
    );
    return () => clearTimeout(timer);
  }, [selection, page]);
  if (loading || error)
    return (
      <main className="csp-root csp-auth" dir="rtl">
        <section className="csp-auth-card">
          {loading ? (
            <p role="status">جارٍ تحميل بيانات Studio…</p>
          ) : (
            <>
              <p role="alert">{error}</p>
              <button className="csp-button" onClick={retry}>
                إعادة المحاولة
              </button>
            </>
          )}
        </section>
      </main>
    );
  return (
    <main className="csp-root" dir={isArabic ? "rtl" : "ltr"}>
      <header className="csp-topbar">
        <div className="csp-brand">
          <button
            type="button"
            className="csp-mobile-menu"
            onClick={() => setMobileNav((value) => !value)}
            aria-label={isArabic ? "فتح قائمة التنقل" : "Open navigation"}
            aria-expanded={mobileNav}
            aria-controls="commercial-prototype-nav"
          >
            <Menu />
          </button>
          <div className="csp-brand-lockup" aria-label="ZOOMIX / STUDIO">
            <ZoomixLogo
              variant="dark"
              className="csp-brand-logo"
              width={180}
              height={60}
            />
            <span className="csp-brand-context">/ STUDIO</span>
          </div>
          <small>COMMAND CENTER</small>
          {storageMode === "cloud" && (
            <span className="csp-storage-state is-cloud" role="status">
              {isArabic ? "متصل بقاعدة البيانات" : "DATABASE CONNECTED"}
            </span>
          )}
        </div>
        <div className="csp-global-search">
          <Search size={16} />
          <input
            ref={searchRef}
            value={globalQuery}
            onChange={(event) => {
              setGlobalQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                document.querySelector("#csp-search-results button")?.focus();
              }
              if (event.key === "Escape") {
                setGlobalQuery("");
                setSearchOpen(false);
              }
            }}
            placeholder={
              isArabic
                ? "ابحث عن عميل، طلب، عرض أو دفعة…"
                : "Search clients, briefs, quotes or payments…"
            }
            aria-label={isArabic ? "البحث الشامل" : "Global search"}
            role="combobox"
            aria-expanded={searchOpen && searchQuery.length >= 2}
            aria-controls="csp-search-results"
          />
          <kbd>⌘ K</kbd>
          {searchOpen && searchQuery.length >= 2 && (
            <div
              className="csp-search-pop"
              id="csp-search-results"
              onKeyDown={(event) => {
                const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
                const index = buttons.indexOf(document.activeElement);
                if (["ArrowDown", "ArrowUp"].includes(event.key)) {
                  event.preventDefault();
                  buttons[
                    (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length
                  ]?.focus();
                }
              }}
              role="listbox"
              aria-label={isArabic ? "نتائج البحث" : "Search results"}
            >
              {searchResults.length ? (
                searchResults.map((result) => (
                  <button
                    type="button"
                    key={result.key}
                    role="option"
                    aria-selected="false"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      navigate(result.target, result.recordId);
                      setGlobalQuery("");
                      setSearchOpen(false);
                    }}
                  >
                    <small>{result.group}</small>
                    <span>{result.label}</span>
                  </button>
                ))
              ) : (
                <p className="csp-search-empty">
                  {isArabic
                    ? `لا توجد نتائج لـ «${globalQuery.trim()}»`
                    : `No results for “${globalQuery.trim()}”`}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="csp-top-actions">
          <button
            type="button"
            className="csp-mobile-search-button"
            aria-label={isArabic ? "فتح البحث الشامل" : "Open global search"}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((value) => !value);
              setNotifOpen(false);
              setQuickOpen(false);
            }}
          >
            <Search />
          </button>
          <div className="csp-quick-wrap">
            <button
              type="button"
              className="csp-quick-action"
              aria-haspopup="menu"
              aria-expanded={quickOpen}
              onClick={() => {
                const next = !quickOpen;
                setQuickOpen(next);
                setSearchOpen(false);
                setNotifOpen(false);
              }}
            >
              <Plus /> <span>{isArabic ? "إجراء سريع" : "Quick action"}</span>
            </button>
            {quickOpen && (
              <div
                className="csp-quick-pop"
                role="menu"
                aria-label={isArabic ? "إجراءات سريعة" : "Quick actions"}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setQuickOpen(false);
                    startNewQuote();
                  }}
                >
                  <FileText size={15} />
                  <span>{isArabic ? "عرض سعر جديد" : "New quote"}</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setQuickOpen(false);
                    navigate("leads");
                  }}
                >
                  <Users size={15} />
                  <span>{isArabic ? "فتح الطلبات" : "Open briefs"}</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setQuickOpen(false);
                    navigate("promotions");
                  }}
                >
                  <BadgePercent size={15} />
                  <span>{isArabic ? "العروض والخصومات" : "Promotions"}</span>
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className="csp-language"
            onClick={() => setLanguage(isArabic ? "en" : "ar")}
            aria-label={isArabic ? "التبديل إلى الإنجليزية" : "Switch to Arabic"}
          >
            {isArabic ? "EN" : "ع"}
          </button>
          <div className="csp-notif-wrap">
            <button
              type="button"
              aria-label={isArabic ? "الإشعارات" : "Notifications"}
              aria-haspopup="true"
              aria-expanded={notifOpen}
              onClick={() => {
                const next = !notifOpen;
                setNotifOpen(next);
                setSearchOpen(false);
                if (next && notifications.length) {
                  const ids = notifications.map((item) => item.key);
                  setSeenNotifications(ids);
                  try {
                    localStorage.setItem("zoomix-notifications-seen", JSON.stringify(ids));
                  } catch {
                    /* التخزين ممتلئ أو محظور */
                  }
                }
              }}
            >
              <Bell />
              {unreadNotifications > 0 && (
                <span className="csp-bell-badge" aria-hidden="true">
                  {unreadNotifications}
                </span>
              )}
            </button>
            {notifOpen && (
              <div
                className="csp-notif-pop"
                role="dialog"
                aria-label={isArabic ? "الإشعارات" : "Notifications"}
              >
                {notifications.length ? (
                  notifications.map((item) => (
                    <button
                      className="csp-notif-item"
                      key={item.key}
                      onClick={() => {
                        navigate("quotes", item.recordId);
                        setNotifOpen(false);
                      }}
                    >
                      <strong>{item.title}</strong>
                      <span>{item.note}</span>
                      <time className="csp-sensitive-number">
                        {new Date(item.at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </button>
                  ))
                ) : (
                  <p className="csp-search-empty">
                    {isArabic ? "لا توجد تنبيهات جديدة." : "No new notifications."}
                  </p>
                )}
              </div>
            )}
          </div>
          <span className="csp-avatar">F</span>
        </div>
      </header>
      {isMobile && searchOpen && (
        <section
          className="csp-mobile-search-panel"
          role="dialog"
          aria-modal="false"
          aria-label={isArabic ? "البحث الشامل" : "Global search"}
        >
          <div className="csp-mobile-search-head">
            <label className="csp-mobile-search-field">
              <Search size={17} aria-hidden="true" />
              <span className="csp-sr-only">{isArabic ? "البحث الشامل" : "Global search"}</span>
              <input
                ref={mobileSearchRef}
                value={globalQuery}
                onChange={(event) => setGlobalQuery(event.target.value)}
                placeholder={
                  isArabic
                    ? "ابحث عن عميل، طلب، عرض أو دفعة…"
                    : "Search clients, briefs, quotes or payments…"
                }
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              className="csp-mobile-search-close"
              onClick={() => setSearchOpen(false)}
              aria-label={isArabic ? "إغلاق البحث" : "Close search"}
            >
              <X size={18} />
            </button>
          </div>
          <div className="csp-mobile-search-results" id="csp-mobile-search-results">
            {searchQuery.length < 2 ? (
              <p className="csp-search-empty">
                {isArabic ? "اكتب حرفين على الأقل للبحث." : "Type at least two characters to search."}
              </p>
            ) : searchResults.length ? (
              searchResults.map((result) => (
                <button
                  type="button"
                  key={result.key}
                  onClick={() => {
                    navigate(result.target, result.recordId);
                    setGlobalQuery("");
                    setSearchOpen(false);
                  }}
                >
                  <small>{result.group}</small>
                  <span>{result.label}</span>
                </button>
              ))
            ) : (
              <p className="csp-search-empty">
                {isArabic
                  ? `لا توجد نتائج لـ «${globalQuery.trim()}»`
                  : `No results for “${globalQuery.trim()}”`}
              </p>
            )}
          </div>
        </section>
      )}
      <div className={`csp-shell ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
        {isMobile && mobileNav && (
          <button
            type="button"
            className="csp-nav-backdrop"
            onClick={() => setMobileNav(false)}
            aria-label={isArabic ? "إغلاق قائمة التنقل" : "Close navigation"}
          />
        )}
        <aside
          id="commercial-prototype-nav"
          className={`csp-sidebar ${mobileNav ? "is-open" : ""}`}
          aria-hidden={isMobile && !mobileNav ? "true" : undefined}
          inert={isMobile && !mobileNav ? true : undefined}
        >
          <button
            type="button"
            className="csp-sidebar-collapse"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={
              sidebarCollapsed
                ? isArabic
                  ? "توسيع القائمة"
                  : "Expand sidebar"
                : isArabic
                  ? "تصغير القائمة"
                  : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            <span>{isArabic ? "تصغير القائمة" : "Collapse"}</span>
          </button>
          <nav>
            {NAV_GROUPS.map((group) => (
              <section className="csp-nav-group" key={group.id}>
                <p>{isArabic ? group.ar : group.en}</p>
                {group.pages.map((pageId) => {
                  const item = NAVIGATION.find(([id]) => id === pageId);
                  if (!item) return null;
                  const [id, Icon, ar, en] = item;
                  return (
                    <button
                      type="button"
                      key={id}
                      title={isArabic ? ar : en}
                      className={page === id ? "is-active" : ""}
                      aria-current={page === id ? "page" : undefined}
                      onClick={() => navigate(id)}
                    >
                      <Icon />
                      <span>{isArabic ? ar : en}</span>
                      {page === id && (isArabic ? <ChevronLeft /> : <ChevronRight />)}
                    </button>
                  );
                })}
              </section>
            ))}
          </nav>
          <button type="button" className="csp-sidebar-quote" onClick={startNewQuote}>
            <Plus />
            <span>{isArabic ? "عرض سعر جديد" : "New quote"}</span>
          </button>
          <footer>
            <button
              type="button"
              aria-current={page === "settings" ? "page" : undefined}
              onClick={() => navigate("settings")}
            >
              <Settings />
              <span>{isArabic ? "الإعدادات وسجل التعديلات" : "Settings & audit log"}</span>
            </button>
          </footer>
        </aside>
        <section className={`csp-content csp-content--${page}`} aria-label={activeNav?.[isArabic ? 2 : 3]}>
          <div className="csp-refresh-state">
            <button className="csp-button" onClick={retry}>
              {isArabic ? "تحديث البيانات" : "Refresh data"}
            </button>
            <span>
              {lastUpdated
                ? `${isArabic ? "آخر تحديث" : "Last updated"}: ${shortTime(lastUpdated)}`
                : ""}
            </span>
            {refreshError && <p role="alert">{refreshError}</p>}
          </div>
          {flash && (
            <p className="csp-flash-note" role="status">
              {flash}
            </p>
          )}
          <SectionBoundary key={`${page}:${draftId}`} language={language}>
            {page === "control" && (
              <ControlView
                language={language}
                onNavigate={navigate}
                onOpenQuote={(id) => navigate("quotes", id)}
                onOpenRequest={(id) => navigate("leads", id)}
                onOpenProject={(id) => navigate("projects", id)}
                onOpenPayment={(id) => navigate("payments", id)}
                quotes={quotes}
                requests={requests}
                projects={projects}
                payments={payments}
                storageMode={storageMode}
                lastUpdatedLabel={lastUpdated ? `${isArabic ? "آخر تحديث" : "Updated"}: ${shortTime(lastUpdated)}` : ""}
                refreshError={refreshError}
                onRefresh={retry}
              />
            )}
            {page === "leads" && (
              <LeadsView
                storageMode={storageMode}
                onUpdated={retry}
                language={language}
                requests={requests}
                quotes={quotes}
                projects={projects}
                payments={payments}
                onCreateQuote={createQuoteFromLead}
                onOpenQuote={(id) => navigate("quotes", id)}
                onOpenProject={(id) => navigate("projects", id)}
                onOpenPayment={(id) => navigate("payments", id)}
                lastUpdatedLabel={lastUpdated ? `${isArabic ? "آخر تحديث" : "Updated"}: ${shortTime(lastUpdated)}` : ""}
                refreshError={refreshError}
                onRefresh={retry}
              />
            )}
            {page === "catalog" && (
              <CatalogView
                language={language}
                catalog={catalog}
                selectedRecord={selection}
                setCatalog={setCatalog}
                storageMode={storageMode}
              />
            )}
            {page === "quotes" && !quoteDetailOpen && (
              <QuoteList
                language={language}
                quotes={quotes || []}
                draftRows={draftRows}
                selectedQuoteId={selectedQuoteId}
                projects={projects || []}
                payments={payments || []}
                onOpenProject={(id) => navigate("projects", id)}
                onOpenPayment={(id) => navigate("payments", id)}
                onOpenQuote={(quoteId, localDraftId, action = "open") => {
                  if (action === "copy") {
                    const sourceId = localDraftId || quoteId;
                    return navigate(
                      "quotes",
                      null,
                      `copy-${sourceId}-${crypto.randomUUID()}`,
                      { copy: sourceId },
                    );
                  }
                  const extraParams = action === "preview" ? { preview: "1" } : {};
                  return localDraftId
                    ? navigate("quotes", null, localDraftId, extraParams)
                    : navigate("quotes", quoteId, null, extraParams);
                }}
              />
            )}
            {page === "quotes" && quoteDetailOpen && (
              <div className="csp-quote-detail-screen">
                <QuoteView
                  key={draftId}
                  draftId={draftId}
                  selectedQuoteId={selectedQuoteId}
                  language={language}
                  catalog={catalog}
                  promotions={promotions}
                  storageMode={storageMode}
                  onBack={() => navigate("quotes")}
                  onQuoteSaved={syncQuote}
                  liveQuoteStatus={
                    quotes?.find((row) => String(row.id) === String(selectedQuoteId))?.status
                  }
                  lead={selectedLead}
                  requests={requests || []}
                  projects={projects || []}
                  payments={payments || []}
                  freshToken={freshToken}
                  freshRef={freshConsumedRef}
                  onOpenRequest={(id) => navigate("leads", id)}
                  onOpenProject={(id) => navigate("projects", id)}
                  onOpenPayment={(id) => navigate("payments", id)}
                  previewOnOpen={params.get("preview") === "1"}
                  sourceQuoteId={params.get("copy") || null}
                />
              </div>
            )}
            {page === "promotions" && (
              <PromotionsView
                language={language}
                promotions={promotions}
                setPromotions={setPromotions}
                catalog={catalog}
                storageMode={storageMode}
              />
            )}
            {page === "projects" && (
              <ProjectsView
                language={language}
                projects={projects}
                quotes={quotes}
                requests={requests}
                payments={payments}
                onOpenQuote={(id) => navigate("quotes", id)}
                onOpenPayment={(id) => navigate("payments", id)}
                storageMode={storageMode}
              />
            )}
            {page === "payments" && (
              <PaymentsView
                language={language}
                payments={payments}
                projects={projects}
                quotes={quotes}
                requests={requests}
                onOpenRequest={(id) => navigate("leads", id)}
                onOpenProject={(id) => navigate("projects", id)}
                onOpenQuote={(id) => navigate("quotes", id)}
                onPaymentUpdated={syncPayment}
                storageMode={storageMode}
                focusFilter={params.get("focus") || ""}
              />
            )}
            {page === "reports" && (
              <ReportsView
                storageMode={storageMode}
                language={language}
                quotes={quotes}
                projects={projects}
                payments={payments}
                onNavigate={navigate}
              />
            )}
            {page === "settings" && <SettingsView language={language} storageMode={storageMode} />}
            {![
              "control",
              "leads",
              "catalog",
              "quotes",
              "promotions",
              "projects",
              "payments",
              "reports",
              "settings",
            ].includes(page) && <PlaceholderView page={page} language={language} />}
          </SectionBoundary>
        </section>
      </div>
      <nav
        className="csp-mobile-bottom-nav"
        aria-label={isArabic ? "التنقل السريع" : "Quick navigation"}
      >
        {[
          ["control", LayoutDashboard, "التحكم", "Control"],
          ["leads", Users, "الطلبات", "Leads"],
          ["quotes", FileText, "العروض", "Quotes"],
        ].map(([id, Icon, ar, en]) => (
          <button
            type="button"
            key={id}
            className={page === id ? "is-active" : ""}
            aria-current={page === id ? "page" : undefined}
            onClick={() => navigate(id)}
          >
            <Icon />
            <span>{isArabic ? ar : en}</span>
          </button>
        ))}
        <button
          type="button"
          className={
            ["catalog", "promotions", "projects", "payments", "reports", "settings"].includes(page)
              ? "is-active"
              : ""
          }
          onClick={() => setMobileNav(true)}
          aria-expanded={mobileNav}
          aria-label={isArabic ? "فتح باقي أقسام Studio" : "Open more Studio sections"}
        >
          <Menu />
          <span>{isArabic ? "المزيد" : "More"}</span>
        </button>
      </nav>
    </main>
  );
}
