import { useEffect, useRef } from "react";
import {
  BadgePercent,
  BarChart3,
  BookOpen,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Users,
  WalletCards,
} from "lucide-react";
import {} from "../../data/commercialStudioPrototype";

export function shortTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
}

export const NAVIGATION = [
  ["control", LayoutDashboard, "التحكم", "Control"],
  ["leads", Users, "الطلبات", "Leads"],
  ["catalog", BookOpen, "قائمة الأسعار", "Price list"],
  ["quotes", FileText, "عروض الأسعار", "Quotes"],
  ["promotions", BadgePercent, "العروض", "Promotions"],
  ["projects", FolderKanban, "المشروعات", "Projects"],
  ["payments", WalletCards, "المدفوعات", "Payments"],
  ["reports", BarChart3, "التقارير", "Reports"],
];

export const NAV_GROUPS = [
  {
    id: "daily",
    ar: "العمل اليومي",
    en: "DAILY WORK",
    pages: ["control", "leads", "quotes", "projects"],
  },
  { id: "commercial", ar: "الإدارة التجارية", en: "COMMERCIAL", pages: ["catalog", "promotions"] },
  {
    id: "finance",
    ar: "المالية والمتابعة",
    en: "FINANCE & INSIGHT",
    pages: ["payments", "reports"],
  },
];

export const money = (value) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const margin = (price, cost) => (price > 0 ? Math.round(((price - cost) / price) * 100) : 0);

export function Label({ ar, en, language }) {
  return language === "ar" ? ar : en;
}

export function StatusChip({ children, accent = false, warning = false }) {
  return (
    <span
      className={`csp-chip ${accent ? "csp-chip--accent" : ""} ${warning ? "csp-chip--warning" : ""}`}
    >
      {children}
    </span>
  );
}

export function Metric({ label, value, note, accent = false }) {
  return (
    <article className={`csp-metric ${accent ? "csp-metric--accent" : ""}`}>
      <p>{label}</p>
      <strong className="csp-sensitive-number">{value}</strong>
      <span>{note}</span>
    </article>
  );
}

const AUDIT_STORAGE_KEY = "zoomix-studio-audit";
export const readLocalAudit = () => {
  try {
    const rows = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
};
export const logAudit = (action, detail) => {
  try {
    const rows = readLocalAudit();
    rows.unshift({ action, detail: String(detail || ""), at: new Date().toISOString() });
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(rows.slice(0, 20)));
  } catch {
    /* التخزين ممتلئ أو محظور */
  }
};
export const AUDIT_LABELS = {
  created: { ar: "إنشاء", en: "Created" },
  updated: { ar: "تعديل", en: "Updated" },
  published: { ar: "نشر", en: "Published" },
  archived: { ar: "أرشفة", en: "Archived" },
  status_changed: { ar: "تغيير حالة", en: "Status changed" },
  version_created: { ar: "إصدار جديد", en: "New version" },
  sent: { ar: "إرسال", en: "Sent" },
  accepted: { ar: "قبول", en: "Accepted" },
  revision_requested: { ar: "طلب تعديل", en: "Revision requested" },
  cancelled: { ar: "إلغاء", en: "Cancelled" },
  quote_saved: { ar: "حفظ مسودة عرض", en: "Quote draft saved" },
  quote_cleared: { ar: "مسح الحفظ المحلي", en: "Local save cleared" },
  quote_sent: { ar: "إرسال عرض (محاكاة)", en: "Quote sent (simulated)" },
  catalog_created: { ar: "إضافة بند", en: "Catalog item created" },
  catalog_updated: { ar: "تعديل بند", en: "Catalog item updated" },
  catalog_archived: { ar: "تغيير حالة بند", en: "Catalog item status" },
  promotion_created: { ar: "إنشاء كود خصم", en: "Promotion created" },
  promotion_status: { ar: "تغيير حالة كود", en: "Promotion status" },
};
export const AUDIT_ENTITIES = {
  catalog_item: { ar: "بند", en: "Item" },
  quote: { ar: "عرض", en: "Quote" },
  promotion: { ar: "كود", en: "Promotion" },
  payment: { ar: "دفعة", en: "Payment" },
  brief: { ar: "بريف", en: "Brief" },
};
export function useEscape(active, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!active) return undefined;
    const trigger = document.activeElement;
    const overlay =
      document.querySelector(".csp-confirm-card") ||
      Array.from(document.querySelectorAll(".csp-modal-backdrop")).pop() ||
      Array.from(document.querySelectorAll(".csp-drawer-backdrop")).pop();
    const focusable = overlay?.querySelectorAll("button, [href], input, select, textarea");
    focusable?.[0]?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Tab" && overlay) {
        const elements = Array.from(
          overlay.querySelectorAll(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
          ),
        ).filter((element) => element.getClientRects().length);
        const first = elements[0],
          last = elements[elements.length - 1];
        if (!first) {
          event.preventDefault();
          return;
        }
        if (
          event.shiftKey &&
          (document.activeElement === first || !overlay.contains(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || !overlay.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (trigger && typeof trigger.focus === "function" && document.contains(trigger))
        trigger.focus();
    };
  }, [active]);
  return null;
}
