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
  const [auditQuery, setAuditQuery] = useState("");
  const [auditEntity, setAuditEntity] = useState("");
  const [auditAction, setAuditAction] = useState("");
  const [backupFile, setBackupFile] = useState(null);
  const [backupPreview, setBackupPreview] = useState(null);
  const [backupState, setBackupState] = useState("idle");
  const [backupMessage, setBackupMessage] = useState("");
  const [restoreConfirmed, setRestoreConfirmed] = useState(false);
  const [restoreSecondConfirmed, setRestoreSecondConfirmed] = useState(false);
  const [rollbackConfirmed, setRollbackConfirmed] = useState(false);
  const [rollbackSecondConfirmed, setRollbackSecondConfirmed] = useState(false);
  const [auditRows, setAuditRows] = useState(() =>
    storageMode === "cloud" ? null : readLocalAudit(),
  );
  useEffect(() => {
    if (storageMode !== "cloud") {
      const query = auditQuery.trim().toLowerCase();
      setAuditRows(
        readLocalAudit().filter((row) => {
          const haystack =
            `${row.action || ""} ${row.entity || ""} ${row.entityId || ""} ${row.detail || ""}`.toLowerCase();
          return (
            (!query || haystack.includes(query)) &&
            (!auditEntity || row.entity === auditEntity) &&
            (!auditAction || row.action === auditAction)
          );
        }),
      );
      return;
    }
    setAuditRows(null);
    const params = new URLSearchParams();
    if (auditQuery.trim()) params.set("q", auditQuery.trim());
    if (auditEntity) params.set("entity", auditEntity);
    if (auditAction) params.set("action", auditAction);
    studioFetch(`/api/studio/audit${params.toString() ? `?${params}` : ""}`)
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
              reason: entry.reason,
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
  }, [storageMode, retry, auditQuery, auditEntity, auditAction]);
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
  const previewBackup = async () => {
    if (!backupFile) return;
    setBackupState("previewing");
    setBackupMessage("");
    try {
      const backup = JSON.parse((await backupFile.text()).replace(/^\uFEFF/, ""));
      const response = await studioFetch("/api/studio/backup/preview", {
        method: "POST",
        body: JSON.stringify(backup),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Preview failed");
      setBackupPreview({ backup, ...payload });
      setRestoreConfirmed(false);
      setRestoreSecondConfirmed(false);
      setRollbackConfirmed(false);
      setRollbackSecondConfirmed(false);
      setBackupState("previewed");
      setBackupMessage(
        isArabic
          ? "تمت معاينة النسخة دون تغيير البيانات."
          : "Backup preview completed without changing data.",
      );
    } catch (error) {
      setBackupState("error");
      setBackupMessage(error.message);
    }
  };
  const restoreBackup = async () => {
    if (!backupPreview || !restoreConfirmed || !restoreSecondConfirmed) return;
    setBackupState("restoring");
    setBackupMessage("");
    try {
      const response = await studioFetch("/api/studio/backup/restore", {
        method: "POST",
        body: JSON.stringify({
          backup: backupPreview.backup,
          previewToken: backupPreview.previewToken,
          confirmation: "RESTORE",
          secondConfirmation: "RESTORE",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Restore failed");
      setBackupPreview((current) => ({ ...current, restoreId: payload.restoreId }));
      setBackupState("restored");
      setBackupMessage(
        isArabic
          ? "تمت الاستعادة في البيئة المعزولة. يمكنك التراجع الآن."
          : "Restore completed in the isolated environment. You can roll it back now.",
      );
      setRetry((value) => value + 1);
    } catch (error) {
      setBackupState("error");
      setBackupMessage(error.message);
    }
  };
  const rollbackBackup = async () => {
    if (!backupPreview?.restoreId || !rollbackConfirmed || !rollbackSecondConfirmed) return;
    setBackupState("rolling-back");
    setBackupMessage("");
    try {
      const response = await studioFetch("/api/studio/backup/rollback", {
        method: "POST",
        body: JSON.stringify({
          restoreId: backupPreview.restoreId,
          confirmation: "ROLLBACK",
          secondConfirmation: "ROLLBACK",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Rollback failed");
      setBackupState("rolled-back");
      setBackupMessage(
        isArabic
          ? "تم التراجع وإرجاع بيانات ما قبل الاستعادة."
          : "Rollback completed and the pre-restore data was returned.",
      );
      setRetry((value) => value + 1);
    } catch (error) {
      setBackupState("error");
      setBackupMessage(error.message);
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
              ? "ملف خاص يحتوي بيانات العملاء؛ احفظه في مكان آمن. الاستعادة متاحة للاختبار المعزول فقط، ولن تعمل على الإنتاج."
              : "Private customer data: store it securely. Restore is available only for isolated testing and is disabled in production."}
          </p>
          <div className="csp-backup-restore">
            <div className="csp-panel-head">
              <h3>
                {isArabic ? "استعادة نسخة — D1 معزولة فقط" : "Restore backup — isolated D1 only"}
              </h3>
              <StatusChip warning>ISOLATED ONLY</StatusChip>
            </div>
            <p>
              {isArabic
                ? "ارفع ملف JSON من زر التنزيل، عاينه أولًا، ثم أكد الاستعادة مرتين. زر التراجع يعيد الحالة السابقة من لقطة محمية."
                : "Upload a JSON backup, preview it first, then confirm restore twice. Rollback uses a protected snapshot of the previous state."}
            </p>
            <label className="csp-file-picker">
              <span>{isArabic ? "ملف النسخة" : "Backup file"}</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(event) => setBackupFile(event.target.files?.[0] || null)}
              />
            </label>
            <button
              type="button"
              className="csp-button"
              onClick={previewBackup}
              disabled={
                !backupFile ||
                backupState === "previewing" ||
                backupState === "restoring" ||
                backupState === "rolling-back"
              }
            >
              {backupState === "previewing"
                ? isArabic
                  ? "جارٍ الفحص…"
                  : "Previewing…"
                : isArabic
                  ? "معاينة النسخة"
                  : "Preview backup"}
            </button>
            {backupPreview && (
              <div className="csp-backup-preview">
                <strong>{isArabic ? "ملخص المعاينة" : "Preview summary"}</strong>
                <span>
                  {isArabic ? "إجمالي السجلات" : "Total rows"}: {backupPreview.totalRows}
                </span>
                <span>
                  {backupPreview.tables.map((table) => `${table.name}: ${table.rows}`).join(" · ")}
                </span>
                <label className="csp-confirm-line">
                  <input
                    type="checkbox"
                    checked={restoreConfirmed}
                    onChange={(event) => setRestoreConfirmed(event.target.checked)}
                  />
                  {isArabic
                    ? "أؤكد أن هذه نسخة D1 المعزولة المقصودة."
                    : "I confirm this is the intended isolated D1 backup."}
                </label>
                <label className="csp-confirm-line">
                  <input
                    type="checkbox"
                    checked={restoreSecondConfirmed}
                    onChange={(event) => setRestoreSecondConfirmed(event.target.checked)}
                  />
                  {isArabic ? "أؤكد الاستعادة الثانية: RESTORE." : "Second confirmation: RESTORE."}
                </label>
                <button
                  type="button"
                  className="csp-button csp-button--danger"
                  onClick={restoreBackup}
                  disabled={
                    !restoreConfirmed ||
                    !restoreSecondConfirmed ||
                    backupState === "restoring" ||
                    backupState === "rolled-back"
                  }
                >
                  {backupState === "restoring"
                    ? isArabic
                      ? "جارٍ الاستعادة…"
                      : "Restoring…"
                    : isArabic
                      ? "استعادة النسخة"
                      : "Restore backup"}
                </button>
              </div>
            )}
            {backupPreview?.restoreId && backupState === "restored" && (
              <div className="csp-backup-preview csp-backup-rollback">
                <strong>{isArabic ? "اختبار التراجع" : "Rollback test"}</strong>
                <label className="csp-confirm-line">
                  <input
                    type="checkbox"
                    checked={rollbackConfirmed}
                    onChange={(event) => setRollbackConfirmed(event.target.checked)}
                  />
                  {isArabic
                    ? "أؤكد أنني أريد إرجاع الحالة السابقة."
                    : "I confirm that I want to return to the previous state."}
                </label>
                <label className="csp-confirm-line">
                  <input
                    type="checkbox"
                    checked={rollbackSecondConfirmed}
                    onChange={(event) => setRollbackSecondConfirmed(event.target.checked)}
                  />
                  {isArabic ? "أؤكد التراجع الثاني: ROLLBACK." : "Second confirmation: ROLLBACK."}
                </label>
                <button
                  type="button"
                  className="csp-button"
                  onClick={rollbackBackup}
                  disabled={
                    !rollbackConfirmed || !rollbackSecondConfirmed || backupState === "rolling-back"
                  }
                >
                  {backupState === "rolling-back"
                    ? isArabic
                      ? "جارٍ التراجع…"
                      : "Rolling back…"
                    : isArabic
                      ? "تراجع عن الاستعادة"
                      : "Rollback restore"}
                </button>
              </div>
            )}
            {backupMessage && (
              <p
                className={backupState === "error" ? "csp-warning" : "csp-success-note"}
                role="status"
              >
                {backupMessage}
              </p>
            )}
          </div>
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
        <div className="csp-audit-filters" role="search">
          <label>
            <span>{isArabic ? "بحث" : "Search"}</span>
            <input
              value={auditQuery}
              onChange={(event) => setAuditQuery(event.target.value)}
              placeholder={isArabic ? "عملية، عنصر، أو رقم" : "Action, entity or id"}
            />
          </label>
          <label>
            <span>{isArabic ? "العنصر" : "Entity"}</span>
            <select value={auditEntity} onChange={(event) => setAuditEntity(event.target.value)}>
              <option value="">{isArabic ? "كل العناصر" : "All entities"}</option>
              {Object.keys(AUDIT_ENTITIES).map((entity) => (
                <option key={entity} value={entity}>
                  {AUDIT_ENTITIES[entity][isArabic ? "ar" : "en"]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{isArabic ? "العملية" : "Action"}</span>
            <select value={auditAction} onChange={(event) => setAuditAction(event.target.value)}>
              <option value="">{isArabic ? "كل العمليات" : "All actions"}</option>
              {Object.keys(AUDIT_LABELS).map((action) => (
                <option key={action} value={action}>
                  {AUDIT_LABELS[action][isArabic ? "ar" : "en"]}
                </option>
              ))}
            </select>
          </label>
          {(auditQuery || auditEntity || auditAction) && (
            <button
              type="button"
              className="csp-button"
              onClick={() => {
                setAuditQuery("");
                setAuditEntity("");
                setAuditAction("");
              }}
            >
              {isArabic ? "مسح الفلاتر" : "Clear filters"}
            </button>
          )}
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
