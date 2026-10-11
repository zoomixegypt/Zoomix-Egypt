import { useSearchParams } from "react-router-dom";
import { confirmLeave } from "./studio/unsaved";
import { readDrafts } from "./studio/drafts";
import { leadForDraft, visibleQuoteDrafts } from "./studio/briefs";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgePercent,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Users,
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
    "local-draft": isArabic ? "مسودة على الجهاز" : "Device draft",
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

function QuoteList({ language, quotes = [], draftRows = [], onOpenQuote }) {
  const isArabic = language === "ar";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [valueRange, setValueRange] = useState("all");
  const [version, setVersion] = useState("all");

  const records = useMemo(
    () => [
      ...(quotes || []).map((row) => ({
        ...row,
        kind: "quote",
        status: row.status || "draft",
        version: Number(row.version || 0),
        total: Number.isFinite(Number(row.total)) ? Number(row.total) : null,
        searchText: [row.reference, row.clientName, row.projectName].filter(Boolean).join(" "),
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
        ]
          .filter(Boolean)
          .join(" "),
      })),
    ],
    [draftRows, quotes],
  );

  const versions = useMemo(
    () =>
      [...new Set(records.map((row) => row.version).filter((value) => value > 0))].sort(
        (a, b) => a - b,
      ),
    [records],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return records.filter((row) => {
      const matchesQuery =
        !normalizedQuery || row.searchText.toLocaleLowerCase().includes(normalizedQuery);
      const matchesStatus = status === "all" || row.status === status;
      const matchesRange = quoteMatchesValueRange(row.total, valueRange);
      const matchesVersion = version === "all" || String(row.version) === version;
      return matchesQuery && matchesStatus && matchesRange && matchesVersion;
    });
  }, [query, records, status, valueRange, version]);

  const hasFilters =
    Boolean(query.trim()) || status !== "all" || valueRange !== "all" || version !== "all";
  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setValueRange("all");
    setVersion("all");
  };

  return (
    <section className="csp-draft-list csp-quote-list" aria-labelledby="quote-list-title">
      <div className="csp-quote-list-head">
        <div>
          <p className="csp-kicker">QUOTES / SEARCH + FILTER</p>
          <h2 id="quote-list-title">{isArabic ? "العروض والمسودات" : "Quotes and drafts"}</h2>
        </div>
        <span className="csp-quote-list-count">
          {filtered.length} / {records.length}
        </span>
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
        {hasFilters && (
          <button type="button" className="csp-button" onClick={resetFilters}>
            {isArabic ? "مسح الفلاتر" : "Clear filters"}
          </button>
        )}
      </div>
      {filtered.length ? (
        <div className="csp-quote-list-grid">
          {filtered.map((row) => {
            const isLocal = row.kind === "local-draft";
            const reference = isLocal
              ? row.record?.reference || (isArabic ? "مسودة محلية" : "Local draft")
              : row.reference;
            return (
              <button
                type="button"
                className="csp-quote-list-row"
                key={`${row.kind}-${row.id}`}
                onClick={() => (isLocal ? onOpenQuote(null, row.id) : onOpenQuote(row.id))}
              >
                <span>
                  <strong>{reference || (isArabic ? "عرض بلا مرجع" : "Unreferenced quote")}</strong>
                  <small>{row.clientName || (isArabic ? "بدون اسم عميل" : "Unnamed client")}</small>
                  <small>
                    {row.projectName || (isArabic ? "بدون اسم مشروع" : "Unnamed project")}
                  </small>
                </span>
                <span className="csp-quote-list-meta">
                  <b>{quoteStatusLabel(row.status, isArabic)}</b>
                  <small>
                    {row.version > 0 ? (isArabic ? `V${row.version}` : `v${row.version}`) : "—"}
                  </small>
                </span>
                <span className="csp-quote-list-total">
                  {row.total == null
                    ? "—"
                    : `${money(row.total, language)} ${isArabic ? "جنيه" : "EGP"}`}
                </span>
              </button>
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
      if (!event.target.closest?.(".csp-global-search")) setSearchOpen(false);
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
    if (!flash) return undefined;
    const timer = window.setTimeout(() => setFlash(""), 5000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const navigate = (next, recordId = null, nextDraft = null) => {
    if (!confirmLeave()) return false;
    lastParams.current = new URLSearchParams({
      view: next,
      ...(recordId ? { record: String(recordId) } : {}),
      ...(nextDraft ? { draft: nextDraft } : {}),
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
          <span>ZOOMIX / STUDIO</span>
          <small>COMMAND CENTER</small>
          <span className={`csp-storage-state is-${storageMode}`} role="status">
            {storageMode === "cloud"
              ? isArabic
                ? "متصل بقاعدة البيانات"
                : "DATABASE CONNECTED"
              : isArabic
                ? "وضع محلي تجريبي"
                : "LOCAL DEMO MODE"}
          </span>
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
        <section className="csp-content" aria-label={activeNav?.[isArabic ? 2 : 3]}>
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
                quotes={quotes}
                requests={requests}
                storageMode={storageMode}
              />
            )}
            {page === "leads" && (
              <LeadsView
                storageMode={storageMode}
                onUpdated={retry}
                language={language}
                requests={requests}
                quotes={quotes}
                onCreateQuote={createQuoteFromLead}
                onOpenQuote={(id) => navigate("quotes", id)}
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
            {page === "quotes" && (
              <QuoteList
                language={language}
                quotes={quotes || []}
                draftRows={draftRows}
                onOpenQuote={(quoteId, localDraftId) =>
                  localDraftId
                    ? navigate("quotes", null, localDraftId)
                    : navigate("quotes", quoteId)
                }
              />
            )}
            {page === "quotes" && (
              <QuoteView
                key={draftId}
                draftId={draftId}
                selectedQuoteId={selectedQuoteId}
                language={language}
                catalog={catalog}
                promotions={promotions}
                storageMode={storageMode}
                onQuoteSaved={syncQuote}
                liveQuoteStatus={
                  quotes?.find((row) => String(row.id) === String(selectedQuoteId))?.status
                }
                lead={selectedLead}
                requests={requests || []}
                freshToken={freshToken}
                freshRef={freshConsumedRef}
              />
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
              <ProjectsView language={language} projects={projects} storageMode={storageMode} />
            )}
            {page === "payments" && (
              <PaymentsView
                language={language}
                payments={payments}
                onPaymentUpdated={syncPayment}
                storageMode={storageMode}
              />
            )}
            {page === "reports" && (
              <ReportsView
                storageMode={storageMode}
                language={language}
                quotes={quotes}
                projects={projects}
                payments={payments}
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
        <button type="button" onClick={() => setMobileNav(true)} aria-expanded={mobileNav}>
          <Menu />
          <span>{isArabic ? "المزيد" : "More"}</span>
        </button>
      </nav>
    </main>
  );
}
