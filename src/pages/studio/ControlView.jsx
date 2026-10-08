import { BarChart3, ChevronRight, FileText, Plus, Users } from "lucide-react";
import {} from "../../data/commercialStudioPrototype";

import { money, margin, StatusChip, Metric } from "./shared";
export default function ControlView({
  language,
  onNavigate,
  onOpenQuote,
  quotes,
  requests,
  storageMode,
}) {
  const isArabic = language === "ar";
  const liveQuotes = Array.isArray(quotes) ? quotes : null;
  const liveRequests = Array.isArray(requests) ? requests : null;
  const hasQuoteData = liveQuotes !== null;
  const openQuotes =
    liveQuotes?.filter((quote) => !["accepted", "cancelled", "expired"].includes(quote.status)) ||
    [];
  const quoteTotal = openQuotes.reduce((sum, quote) => sum + quote.total, 0);
  const expectedMargin = margin(
    openQuotes.reduce((sum, quote) => sum + (quote.netValue ?? quote.total), 0),
    openQuotes.reduce((sum, quote) => sum + quote.internalCost, 0),
  );
  const priorityQuote =
    openQuotes.find((quote) => quote.status === "revision_requested") ||
    openQuotes.find((quote) => quote.status === "viewed") ||
    openQuotes[0];
  const statusCopy = (status) =>
    ({
      draft: isArabic ? "مسودة" : "DRAFT",
      sent: isArabic ? "مرسل" : "SENT",
      viewed: isArabic ? "تمت المشاهدة" : "VIEWED",
      revision_requested: isArabic ? "طلب تعديل" : "REVISION",
      accepted: isArabic ? "مقبول" : "ACCEPTED",
    })[status] || status;
  const quoteListRows = hasQuoteData
    ? openQuotes
        .slice(0, 5)
        .map((quote) => [
          quote.reference,
          quote.clientName || quote.projectName,
          quote.lastEvent ? statusCopy(quote.lastEvent) : statusCopy(quote.status),
          statusCopy(quote.status),
          quote.total,
        ])
    : [];
  const activityRows = hasQuoteData
    ? liveQuotes
        .filter((quote) => quote.lastEvent)
        .slice(0, 5)
        .map((quote) => [
          statusCopy(quote.lastEvent),
          `${quote.reference} · ${quote.clientName || quote.projectName}`,
          new Date(quote.lastEventAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        ])
    : [];
  const pendingNote = isArabic ? "بانتظار الربط" : "Awaiting setup";
  return (
    <div className="csp-view-enter">
      <header className="csp-page-head">
        <div>
          <p className="csp-kicker">TODAY / COMMERCIAL PULSE</p>
          <h1>{isArabic ? "غرفة التحكم" : "CONTROL ROOM"}</h1>
          <p className="csp-page-description">
            {isArabic
              ? "اعرف ما يحتاج قرارًا الآن، ثم نفّذه من نفس المكان."
              : "See what needs a decision now, then act without leaving the workspace."}
          </p>
          {storageMode === "local" && (
            <p className="csp-mode-note" role="status">
              {isArabic
                ? "الوضع التجريبي المحلي — الأرقام والقوائم الفعلية (طلبات، عروض، مدفوعات) تتاح عند ربط القاعدة السحابية."
                : "Local demo mode — live numbers and lists (briefs, quotes, payments) appear once the cloud database is connected."}
            </p>
          )}
        </div>
        <div className="csp-head-actions">
          <button type="button" className="csp-button" onClick={() => onNavigate("leads")}>
            <Users size={16} />
            {isArabic ? "افتح الطلبات" : "Open leads"}
          </button>
          <button
            type="button"
            className="csp-button csp-button--primary"
            onClick={() => onNavigate("quotes")}
          >
            <Plus size={16} />
            {isArabic ? "عرض جديد" : "New quote"}
          </button>
        </div>
      </header>

      <section className="csp-priority-strip">
        <div className="csp-priority-signal">
          <span>01</span>
          <i />
        </div>
        <div>
          <p>{isArabic ? "أهم خطوة الآن" : "HIGHEST PRIORITY"}</p>
          <strong>
            {priorityQuote
              ? isArabic
                ? `تابع عرض ${priorityQuote.clientName || priorityQuote.projectName}`
                : `Follow up ${priorityQuote.clientName || priorityQuote.projectName}`
              : isArabic
                ? "أنشئ أول عرض سعر من طلب عميل"
                : "Create the first quote from a client brief"}
          </strong>
          <small>
            {priorityQuote
              ? `${priorityQuote.reference} · ${statusCopy(priorityQuote.status)} · ${money(priorityQuote.total)} EGP`
              : hasQuoteData
                ? isArabic
                  ? "لا توجد عروض مفتوحة حاليًا"
                  : "No open quotes right now"
                : isArabic
                  ? "لا توجد بيانات متصلة بعد — الأقسام جاهزة لاستقبال البيانات."
                  : "No connected data yet — sections are ready for live data."}
          </small>
        </div>
        <button
          type="button"
          className="csp-button csp-button--primary"
          onClick={() => (priorityQuote ? onOpenQuote?.(priorityQuote.id) : onNavigate("quotes"))}
        >
          {isArabic ? "افتح العرض" : "Open quote"}
          <ChevronRight size={16} />
        </button>
      </section>

      <section className="csp-metrics-grid">
        <Metric
          label={isArabic ? "طلبات جديدة" : "NEW LEADS"}
          value={
            liveRequests ? String(liveRequests.filter((item) => item.status === "new").length) : "—"
          }
          note={
            liveRequests
              ? `${liveRequests.filter((request) => request.status === "new").length} ${isArabic ? "تحتاج ردًا" : "need a reply"}`
              : pendingNote
          }
        />
        <Metric
          label={isArabic ? "عروض مفتوحة" : "OPEN QUOTES"}
          value={hasQuoteData ? String(openQuotes.length) : "—"}
          note={
            hasQuoteData
              ? `${money(quoteTotal)} ${isArabic ? "جنيه إجمالي" : "EGP total"}`
              : pendingNote
          }
        />
        <Metric
          label={isArabic ? "متابعات" : "FOLLOW UPS"}
          value={
            hasQuoteData
              ? String(
                  openQuotes.filter((quote) =>
                    ["sent", "viewed", "revision_requested"].includes(quote.status),
                  ).length,
                )
              : "—"
          }
          note={hasQuoteData ? (isArabic ? "تحتاج قرارًا" : "Need a decision") : pendingNote}
        />
        <Metric
          label={isArabic ? "هامش متوقع" : "EXPECTED MARGIN"}
          value={hasQuoteData ? `${expectedMargin}%` : "—"}
          note={hasQuoteData ? (isArabic ? "للعروض النشطة" : "Across active quotes") : pendingNote}
          accent
        />
      </section>

      <section className="csp-dashboard-grid">
        <div className="csp-panel">
          <div className="csp-panel-head">
            <h2>{isArabic ? "عروض تحتاج حركة" : "Quotes needing movement"}</h2>
            <StatusChip>
              {hasQuoteData ? `VIEW ALL ${openQuotes.length}` : isArabic ? "غير متصل" : "OFFLINE"}
            </StatusChip>
          </div>
          {quoteListRows.length ? (
            quoteListRows.map(([reference, title, note, state, price], index) => (
              <button
                type="button"
                className="csp-list-row"
                key={reference}
                onClick={() => onOpenQuote?.(openQuotes[index].id)}
              >
                <span>
                  <strong>
                    {reference} · {title}
                  </strong>
                  <small>{note}</small>
                </span>
                <StatusChip accent={state === "VIEWED" || state === "تمت المشاهدة"}>
                  {state}
                </StatusChip>
                <b className="csp-sensitive-number">{money(price, language)}</b>
              </button>
            ))
          ) : (
            <div className="csp-empty-state">
              <FileText />
              <strong>
                {hasQuoteData
                  ? isArabic
                    ? "لا توجد عروض مفتوحة"
                    : "No open quotes"
                  : isArabic
                    ? "لا توجد بيانات متصلة"
                    : "No connected data"}
              </strong>
              <span>
                {hasQuoteData
                  ? isArabic
                    ? "ابدأ بإنشاء أول عرض سعر."
                    : "Create your first quote to get started."
                  : isArabic
                    ? "ستظهر العروض هنا فور ربط القاعدة."
                    : "Quotes will appear here once the database is connected."}
              </span>
            </div>
          )}
        </div>
        <div className="csp-panel csp-activity-panel">
          <div className="csp-panel-head">
            <h2>{isArabic ? "نشاط اليوم" : "Today's activity"}</h2>
            <StatusChip>{hasQuoteData ? "LIVE" : isArabic ? "غير متصل" : "OFFLINE"}</StatusChip>
          </div>
          {activityRows.length ? (
            activityRows.map(([title, note, state]) => (
              <div className="csp-task" key={title}>
                <div>
                  <strong>{title}</strong>
                  <time className="csp-sensitive-number">{state}</time>
                </div>
                <p>{note}</p>
              </div>
            ))
          ) : (
            <div className="csp-empty-state">
              <BarChart3 />
              <strong>{isArabic ? "لا يوجد نشاط بعد" : "No activity yet"}</strong>
              <span>
                {hasQuoteData
                  ? isArabic
                    ? "أحداث العروض هتظهر هنا لحظيًا."
                    : "Quote events stream here live."
                  : isArabic
                    ? "سيظهر النشاط فور ربط القاعدة."
                    : "Activity appears once the database is connected."}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
