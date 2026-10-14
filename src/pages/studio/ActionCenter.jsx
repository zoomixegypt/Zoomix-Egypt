import {
  AlertTriangle,
  ArrowUpLeft,
  CalendarClock,
  FileText,
  FolderKanban,
  MessageCircle,
  WalletCards,
} from "lucide-react";
import { StatusChip } from "./shared";

const dateValue = (row) => row?.dueAt || row?.due_at || row?.followUpAt || row?.follow_up_at || null;
const lastInteraction = (row) => row?.lastEventAt || row?.last_event_at || row?.updatedAt || row?.updated_at || row?.createdAt || row?.created_at || null;

const dateLabel = (value, isArabic) => {
  if (!value) return isArabic ? "بدون موعد محدد" : "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return isArabic ? "بدون موعد محدد" : "No due date";
  const delta = Math.ceil((date.getTime() - Date.now()) / 86400000);
  const formatted = new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
  if (delta < 0) return isArabic ? `متأخر · ${formatted}` : `Overdue · ${formatted}`;
  if (delta === 0) return isArabic ? "اليوم" : "Due today";
  if (delta === 1) return isArabic ? "غدًا" : "Tomorrow";
  return formatted;
};

const lastTouchLabel = (value, isArabic) => {
  if (!value) return isArabic ? "غير مسجل" : "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return isArabic ? "غير مسجل" : "Not recorded";
  return new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

const recordTitle = (row) => row?.clientName || row?.name || row?.projectName || row?.project || row?.reference || "—";
const amountLabel = (value, isArabic) => {
  const amount = Number(value);
  const formatted = Number.isFinite(amount) ? new Intl.NumberFormat("en-US").format(amount) : String(value || 0);
  return isArabic ? `جنيه ${formatted}` : `${formatted} EGP`;
};

function buildActions({ requests, quotes, projects, payments, isArabic }) {
  const actions = [];
  const push = (action) => actions.push({ priority: 50, ...action });

  (Array.isArray(requests) ? requests : [])
    .filter((row) => !row?.is_test && !row?.isTest && ["new", "contacted", "in-progress"].includes(row?.status))
    .forEach((row) => {
      const isNew = row.status === "new";
      push({
        key: `request-${row.id}`,
        kind: "request",
        icon: MessageCircle,
        record: row,
        label: isNew ? (isArabic ? "راجع الطلب" : "Review lead") : (isArabic ? "تابع مع العميل" : "Follow up with client"),
        detail: row.project || row.service || row.reference_code,
        priority: isNew ? 100 : row.status === "in-progress" ? 70 : 80,
      });
    });

  (Array.isArray(quotes) ? quotes : [])
    .filter((row) => !row?.isTest && ["sent", "viewed", "revision_requested", "draft"].includes(row?.status))
    .forEach((row) => {
      const isRevision = row.status === "revision_requested";
      const isDraft = row.status === "draft";
      push({
        key: `quote-${row.id}`,
        kind: "quote",
        icon: FileText,
        record: row,
        label: isRevision
          ? (isArabic ? "راجع طلب التعديل" : "Review revision request")
          : isDraft
            ? (isArabic ? "أكمل العرض" : "Finish quote")
            : (isArabic ? "تابع العرض" : "Follow up quote"),
        detail: `${row.reference || "—"} · ${recordTitle(row)}`,
        priority: isRevision ? 96 : isDraft ? 88 : 72,
      });
    });

  (Array.isArray(projects) ? projects : [])
    .filter((row) => !row?.isTest && ["review", "production", "planning"].includes(row?.status))
    .forEach((row) => {
      const isReview = row.status === "review";
      push({
        key: `project-${row.id}`,
        kind: "project",
        icon: FolderKanban,
        record: row,
        label: isReview ? (isArabic ? "راجع التسليم" : "Review delivery") : (isArabic ? "حدّث التنفيذ" : "Update delivery"),
        detail: row.reference || row.projectName,
        priority: isReview ? 86 : 58,
      });
    });

  (Array.isArray(payments) ? payments : [])
    .filter((row) => !row?.isTest && ["overdue", "pending"].includes(row?.status))
    .forEach((row) => {
      const isOverdue = row.status === "overdue";
      push({
        key: `payment-${row.id}`,
        kind: "payment",
        icon: WalletCards,
        record: row,
        label: isOverdue ? (isArabic ? "تابع الدفعة المتأخرة" : "Follow up overdue payment") : (isArabic ? "راجع الدفعة القادمة" : "Review next payment"),
        detail: `${row.reference || "—"} · ${amountLabel(row.amount, isArabic)}`,
        priority: isOverdue ? 98 : 54,
      });
    });

  return actions.sort((a, b) => b.priority - a.priority || String(a.key).localeCompare(String(b.key))).slice(0, 6);
}

export default function ActionCenter({
  language,
  requests,
  quotes,
  projects,
  payments,
  onOpenRequest,
  onOpenQuote,
  onOpenProject,
  onOpenPayment,
}) {
  const isArabic = language === "ar";
  const actions = buildActions({ requests, quotes, projects, payments, isArabic });
  const open = (action) => {
    if (action.kind === "request") onOpenRequest?.(action.record.id);
    if (action.kind === "quote") onOpenQuote?.(action.record.id);
    if (action.kind === "project") onOpenProject?.(action.record.id);
    if (action.kind === "payment") onOpenPayment?.(action.record.id);
  };

  return (
    <section className="csp-action-center" aria-label={isArabic ? "مركز إجراءات اليوم" : "Today's action center"}>
      <header className="csp-action-center-head">
        <div>
          <p className="csp-kicker">NEXT / ACTION QUEUE</p>
          <h2>{isArabic ? "مركز إجراءات اليوم" : "Today’s action center"}</h2>
          <p>{isArabic ? "أهم الخطوات مجمعة هنا حسب الأولوية، مع الوصول المباشر للسجل." : "The highest-priority next steps, collected with a direct path to each record."}</p>
        </div>
        <span className="csp-action-center-count">{actions.length} {isArabic ? "خطوات" : "actions"}</span>
      </header>
      {actions.length ? (
        <div className="csp-action-center-list">
          {actions.map((action) => {
            const Icon = action.icon;
            const urgent = action.priority >= 95;
            return (
              <article className={`csp-action-row ${urgent ? "is-urgent" : ""}`} key={action.key}>
                <div className="csp-action-row-icon"><Icon size={17} /></div>
                <div className="csp-action-row-copy">
                  <strong>{action.label}</strong>
                  <span>{action.detail}</span>
                </div>
                <div className="csp-action-row-meta">
                  <span><CalendarClock size={13} /> {dateValue(action.record) ? dateLabel(dateValue(action.record), isArabic) : `${isArabic ? "آخر تفاعل" : "Last touch"} · ${lastTouchLabel(lastInteraction(action.record), isArabic)}`}</span>
                  {(action.record.owner || action.record.assignee) && <span>{isArabic ? "مسؤول" : "Owner"}: {action.record.owner || action.record.assignee}</span>}
                  {urgent && <StatusChip warning><AlertTriangle size={12} /> {isArabic ? "أولوية" : "Priority"}</StatusChip>}
                </div>
                <button type="button" className={`csp-button ${urgent ? "csp-button--primary" : ""}`} onClick={() => open(action)}>
                  {isArabic ? "افتح" : "Open"}<ArrowUpLeft size={15} />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="csp-action-center-clear">
          <strong>{isArabic ? "كل شيء هادئ حاليًا" : "Everything is clear for now"}</strong>
          <span>{isArabic ? "لا توجد خطوات مفتوحة تحتاج قرارًا فوريًا." : "There are no open actions that need an immediate decision."}</span>
        </div>
      )}
    </section>
  );
}
