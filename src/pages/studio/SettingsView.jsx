import { studioFetch } from "./api";
import { useEffect, useState } from "react";
import { FileText, MessageCircle, Send } from "lucide-react";
import {} from "../../data/commercialStudioPrototype";

import { StatusChip, readLocalAudit, AUDIT_LABELS, AUDIT_ENTITIES } from "./shared";
export default function SettingsView({ language, storageMode }) {
  const isArabic = language === "ar";
  const [configured, setConfigured] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const [auditRows, setAuditRows] = useState(() =>
    storageMode === "cloud" ? null : readLocalAudit(),
  );
  useEffect(() => {
    if (storageMode !== "cloud") {
      setAuditRows(readLocalAudit());
      return;
    }
    setAuditRows(null);
    studioFetch("/api/studio/audit")
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("unavailable")),
      )
      .then((payload) => {
        if (Array.isArray(payload.entries))
          setAuditRows(
            payload.entries.map((entry) => ({
              action: entry.action,
              entity: entry.entity,
              entityId: entry.entityId,
              at: entry.at,
            })),
          );
      })
      .catch(() =>
        setLoadError(
          isArabic
            ? "تعذر تحميل سجل القاعدة. أعد المحاولة."
            : "Database audit could not be loaded. Retry.",
        ),
      );
  }, [storageMode, retry]);
  useEffect(() => {
    if (storageMode !== "cloud") {
      setConfigured(false);
      return;
    }
    setConfigured(null);
    setLoadError("");
    studioFetch("/api/studio/integrations")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => setConfigured(Boolean(payload.telegram?.configured)))
      .catch(() =>
        setLoadError(
          isArabic
            ? "تعذر التحقق من التكاملات. أعد المحاولة."
            : "Could not check integrations. Retry.",
        ),
      );
  }, [storageMode, retry]);
  const testTelegram = async () => {
    setState("testing");
    setMessage("");
    try {
      const response = await studioFetch("/api/studio/integrations/telegram/test", {
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Test failed");
      setState("success");
      setMessage(
        isArabic ? "تم إرسال رسالة الاختبار إلى Telegram." : "Test message sent to Telegram.",
      );
    } catch (error) {
      setState("error");
      setMessage(error.message);
    }
  };
  const auditLabel = (row) =>
    AUDIT_LABELS[row.action] ? AUDIT_LABELS[row.action][isArabic ? "ar" : "en"] : row.action;
  const auditDetail = (row) => {
    if (!row.entity) return row.detail || "—";
    const entity = AUDIT_ENTITIES[row.entity] || { ar: row.entity, en: row.entity };
    return `${entity[isArabic ? "ar" : "en"]} · ${row.entityId ?? "—"}${row.reason ? ` · ${isArabic ? "السبب" : "Reason"}: ${row.reason}` : ""}`;
  };
  const auditTime = (at) => {
    const date = new Date(at);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
  };
  return (
    <div className="csp-view-enter">
      <header className="csp-page-head">
        <div>
          <p className="csp-kicker">SETTINGS / INTEGRATIONS</p>
          <h1>{isArabic ? "الإعدادات" : "SETTINGS"}</h1>
          <p className="csp-page-description">
            {isArabic
              ? "راجع حالة الخدمات المرتبطة واختبرها بدون كشف المفاتيح السرية."
              : "Review and test connected services without exposing their secrets."}
          </p>
        </div>
      </header>
      {storageMode === "cloud" && (
        <section className="csp-panel">
          <div className="csp-panel-head">
            <h2>{isArabic ? "تصدير البيانات والنسخة الاحتياطية" : "Exports and backup"}</h2>
          </div>
          <div className="csp-head-actions">
            <a className="csp-button" href="/api/studio/export.csv">
              {isArabic ? "تصدير الطلبات CSV" : "Export briefs CSV"}
            </a>
            <a className="csp-button" href="/api/studio/backup.json">
              {isArabic ? "تنزيل نسخة البيانات التجارية JSON" : "Download commercial data JSON"}
            </a>
          </div>
          <p>
            {isArabic
              ? "ملف خاص يحتوي بيانات العملاء؛ احفظه في مكان آمن. الاستعادة ليست إجراءً متاحًا من هذه الشاشة."
              : "Private customer data: store securely. Restore is not available from this screen."}
          </p>
        </section>
      )}
      <section className="csp-panel csp-integration-card">
        <div>
          <MessageCircle />
          <span>
            <p className="csp-kicker">TELEGRAM / ALERTS</p>
            <h2>{isArabic ? "تنبيهات العروض والطلبات" : "Quote and lead alerts"}</h2>
          </span>
          <StatusChip accent={configured === true}>
            {configured === null
              ? isArabic
                ? "لم يتم التحقق"
                : "UNVERIFIED"
              : configured
                ? isArabic
                  ? "المفاتيح مضبوطة"
                  : "CONFIGURED"
                : isArabic
                  ? "غير مُعد"
                  : "NOT CONFIGURED"}
          </StatusChip>
        </div>
        <p>
          {isArabic
            ? "يرسل تنبيهًا عند إرسال العرض وأول مشاهدة والقبول وطلب التعديل. المفاتيح محفوظة داخل Cloudflare فقط."
            : "Alerts fire on send, first view, acceptance and revision requests. Secrets stay inside Cloudflare."}
        </p>
        <code>TELEGRAM_BOT_TOKEN · TELEGRAM_CHAT_ID</code>
        <button
          type="button"
          className="csp-button csp-button--primary"
          onClick={testTelegram}
          disabled={!configured || state === "testing"}
        >
          {state === "testing"
            ? isArabic
              ? "جارٍ الاختبار…"
              : "Testing…"
            : isArabic
              ? "إرسال رسالة اختبار"
              : "Send test message"}
        </button>
        {message && (
          <p className={state === "success" ? "csp-success-note" : "csp-warning"} role="status">
            {message}
          </p>
        )}
      </section>
      <section className="csp-panel csp-table-wrap csp-audit-panel">
        {loadError && (
          <p className="csp-warning" role="alert">
            {loadError}{" "}
            <button type="button" onClick={() => setRetry((value) => value + 1)}>
              {isArabic ? "إعادة المحاولة" : "Retry"}
            </button>
          </p>
        )}
        <div className="csp-panel-head">
          <h2>{isArabic ? "سجل التعديلات" : "Audit log"}</h2>
          <StatusChip accent={storageMode === "cloud"}>
            {storageMode === "cloud" ? "DATABASE" : "THIS DEVICE"}
          </StatusChip>
        </div>
        <div className="csp-table-head csp-audit-head">
          <span>{isArabic ? "العملية" : "Action"}</span>
          <span>{isArabic ? "العنصر" : "Entity"}</span>
          <span>{isArabic ? "الوقت" : "Time"}</span>
        </div>
        {auditRows === null ? (
          <div className="csp-empty-state">
            <FileText />
            <strong>{loadError || (isArabic ? "جارٍ تحميل السجل…" : "Loading activity…")}</strong>
          </div>
        ) : auditRows.length ? (
          auditRows.map((row, index) => (
            <div className="csp-table-row csp-audit-row" key={`${row.at || ""}-${index}`}>
              <span>
                <strong>{auditLabel(row)}</strong>
              </span>
              <span>{auditDetail(row)}</span>
              <time className="csp-sensitive-number">{auditTime(row.at)}</time>
            </div>
          ))
        ) : (
          <div className="csp-empty-state">
            <FileText />
            <strong>{isArabic ? "لا توجد عمليات بعد" : "No activity yet"}</strong>
            <span>
              {isArabic
                ? "هنا تظهر حفظات العروض وأي تعديلات على القائمة والكودات."
                : "Quote saves and catalog or promotion changes appear here."}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
