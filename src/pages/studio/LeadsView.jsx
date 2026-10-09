import { FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { studioRequest } from "./api";
import { LeadFollowUp, WorkspaceDisclosure } from "./BusinessWorkspace";
import { briefLabel, safeDate } from "./briefs";
import {} from "../../data/commercialStudioPrototype";

import { StatusChip } from "./shared";
export default function LeadsView({ language, requests, onCreateQuote, storageMode, onUpdated }) {
  const isArabic = language === "ar";
  const rows = Array.isArray(requests) ? requests : [];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [board, setBoard] = useState(false);
  const [boardError, setBoardError] = useState("");
  const filtered = rows.filter(
    (row) =>
      (!status || (row.status || "new") === status) &&
      [
        row.name,
        row.project,
        row.reference_code,
        row.service,
        row.offer_name,
        row.phone,
        row.email,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
  );
  return (
    <div className="csp-view-enter">
      <header className="csp-page-head">
        <div>
          <p className="csp-kicker">LEADS / BRIEFS</p>
          <h1>{isArabic ? "طلبات العملاء" : "CLIENT BRIEFS"}</h1>
          <p className="csp-page-description">
            {isArabic
              ? "راجع الطلب ثم حوّله إلى عرض سعر مرتبط بدون إعادة كتابة البيانات."
              : "Review a brief, then turn it into a linked quote without retyping client data."}
          </p>
        </div>
      </header>
      <div className="csp-brief-filters">
        <button className="csp-button" onClick={() => setBoard(!board)}>
          {isArabic ? (board ? "عرض القائمة" : "عرض Kanban") : board ? "List view" : "Kanban view"}
        </button>
        <label>
          {isArabic ? "بحث الطلبات" : "Search briefs"}
          <input value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label>
          {isArabic ? "حالة الطلب" : "Brief status"}
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">{isArabic ? "كل الحالات" : "All statuses"}</option>
            {[...new Set(rows.map((row) => row.status || "new"))].map((value) => (
              <option key={value} value={value}>
                {briefLabel(value, language)}
              </option>
            ))}
          </select>
        </label>
        <p role="status">
          {filtered.length} / {rows.length} {isArabic ? "طلب" : "briefs"}
        </p>
      </div>
      <section className="csp-panel csp-table-wrap">
        <div className="csp-table-head csp-leads-head">
          <span>{isArabic ? "العميل والمشروع" : "Client & project"}</span>
          <span>{isArabic ? "الخدمة" : "Service"}</span>
          <span>{isArabic ? "الميزانية" : "Budget"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "الإجراء" : "Action"}</span>
        </div>
        {board && (
          <section className="csp-kanban">
            {["new", "contacted", "in-progress", "won", "archived"].map((s) => (
              <section className="csp-panel csp-operation-panel" key={s}>
                <h3>{briefLabel(s, language)}</h3>
                {filtered
                  .filter((r) => (r.status || "new") === s)
                  .map((r) => (
                    <article key={r.id} className="csp-operation-row">
                      <strong>{r.name}</strong>
                      <p>
                        {r.project} · {r.reference_code}
                      </p>
                      {Boolean(r.is_test) && <StatusChip>TEST QA</StatusChip>}
                      <label>
                        {isArabic ? "نقل إلى" : "Move to"}
                        <select
                          value={s}
                          disabled={storageMode !== "cloud"}
                          onChange={async (e) => {
                            try {
                              await studioRequest(`/api/studio/requests/${r.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({ status: e.target.value }),
                              });
                              onUpdated?.();
                            } catch (error) {
                              setBoardError(error.message);
                            }
                          }}
                        >
                          {["new", "contacted", "in-progress", "won", "archived"].map((value) => (
                            <option key={value} value={value}>
                              {briefLabel(value, language)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </article>
                  ))}
              </section>
            ))}
          </section>
        )}
        {boardError && <p role="alert">{boardError}</p>}
        {!board &&
          filtered.map((request) => (
            <article key={request.id}>
              <div
                id={`studio-record-${request.id}`}
                className="csp-table-row csp-leads-row"
                key={request.id}
              >
                <span className="csp-item-name">
                  <strong>{request.name}</strong>
                  {Boolean(request.is_test) && (
                    <StatusChip>{isArabic ? "اختبار QA" : "TEST QA"}</StatusChip>
                  )}
                  <small>
                    {request.reference_code} ·{" "}
                    {request.project || (isArabic ? "بدون اسم مشروع" : "Untitled project")}
                  </small>
                </span>
                <span>{request.offer_name || request.service}</span>
                <span className="csp-sensitive-number">{briefLabel(request.budget, language)}</span>
                <StatusChip accent={(request.status || "new") === "new"}>
                  {briefLabel(request.status || "new", language)}
                </StatusChip>
                <button
                  type="button"
                  className="csp-button csp-button--primary"
                  onClick={() => onCreateQuote(request)}
                >
                  <FileText size={15} />
                  {isArabic ? "إنشاء عرض" : "Create quote"}
                </button>
              </div>
              <details className="csp-brief-details">
                <summary>
                  {isArabic ? "تفاصيل الطلب كاملة" : "Full brief details"} ·{" "}
                  {request.reference_code}
                </summary>
                {storageMode === "cloud" && (
                  <WorkspaceDisclosure label={isArabic ? "المسؤول والمتابعة" : "Owner & follow-up"}>
                    <LeadFollowUp id={request.id} language={language} />
                  </WorkspaceDisclosure>
                )}
                <dl>
                  {[
                    ["الهاتف", "Phone", request.phone],
                    ["البريد", "Email", request.email],
                    [
                      "التواصل المفضل",
                      "Preferred contact",
                      request.contact_preference
                        ? briefLabel(request.contact_preference, language)
                        : null,
                    ],
                    [
                      "وقت التواصل",
                      "Contact time",
                      request.preferred_time ? briefLabel(request.preferred_time, language) : null,
                    ],
                    ["النشاط", "Activity", request.activity],
                    ["المسار", "Route", request.route],
                    ["الخدمة", "Service", request.offer_name || request.service],
                    ["نوع الظهور", "Show type", request.show_type],
                    ["مصدر الخامات", "Content source", request.content_source],
                    ["نوع الحدث", "Event type", request.event_type],
                    [
                      "تاريخ الحدث",
                      "Event date",
                      request.event_date ? safeDate(request.event_date, language) : null,
                    ],
                    ["مكان الحدث", "Event location", request.event_location],
                    ["التغطية", "Coverage", request.coverage_type],
                    ["مرحلة المشروع", "Stage", request.stage],
                    ["الميزانية", "Budget", briefLabel(request.budget, language)],
                    [
                      "المدة المطلوبة",
                      "Requested timeline",
                      briefLabel(request.launch_timeline, language),
                    ],
                    ["رابط المشروع", "Project link", request.project_link],
                    ["الهدف", "Goal", request.goal],
                    ["الوصف الكامل", "Full description", request.description],
                    ["ملاحظات الإدارة", "Admin notes", request.notes],
                    [
                      "تاريخ الطلب",
                      "Created",
                      request.created_at ? safeDate(request.created_at, language) : null,
                    ],
                  ]
                    .filter(([, , value]) => value)
                    .map(([ar, en, value]) => (
                      <div key={en}>
                        <dt>{isArabic ? ar : en}</dt>
                        <dd dir="auto">{value}</dd>
                      </div>
                    ))}
                </dl>
                {storageMode === "cloud" && (
                  <BriefManagement request={request} language={language} onUpdated={onUpdated} />
                )}
              </details>
            </article>
          ))}
        {rows.length > 0 && !filtered.length && (
          <p className="csp-empty-state">
            {isArabic ? "لا توجد طلبات مطابقة للبحث." : "No matching briefs."}
          </p>
        )}
        {!rows.length && (
          <div className="csp-empty-state">
            <Users />
            <strong>{isArabic ? "لا توجد طلبات بعد" : "No briefs yet"}</strong>
            <span>
              {isArabic
                ? "ستظهر طلبات الموقع هنا تلقائيًا."
                : "Website briefs will appear here automatically."}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

function BriefManagement({ request, language, onUpdated }) {
  const ar = language === "ar";
  const [status, setStatus] = useState(request.status || "new");
  const [notes, setNotes] = useState(request.notes || "");
  const [isTest, setIsTest] = useState(Boolean(request.is_test));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!dirty) {
      setStatus(request.status || "new");
      setNotes(request.notes || "");
      setIsTest(Boolean(request.is_test));
    }
  }, [request.status, request.notes, request.is_test, dirty]);
  return (
    <form
      className="csp-form-grid"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        setFailed(false);
        try {
          await studioRequest(`/api/studio/requests/${request.id}`, {
            method: "PATCH",
            body: JSON.stringify({ status, notes, isTest }),
          });
          setDirty(false);
          setMessage(ar ? "تم حفظ بيانات الإدارة." : "Management data saved.");
          onUpdated?.();
        } catch (error) {
          setFailed(true);
          setMessage(error.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        {ar ? "حالة الطلب" : "Brief status"}
        <select
          disabled={busy}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setDirty(true);
          }}
        >
          {["new", "contacted", "in-progress", "won", "archived"].map((s) => (
            <option key={s} value={s}>
              {briefLabel(s, language)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {ar ? "ملاحظات الإدارة" : "Admin notes"}
        <textarea
          disabled={busy}
          maxLength={4000}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setDirty(true);
          }}
        />
      </label>
      <label>
        <input
          disabled={busy}
          type="checkbox"
          checked={isTest}
          onChange={(e) => {
            setIsTest(e.target.checked);
            setDirty(true);
          }}
        />
        {ar
          ? "بيانات اختبار — يشمل استبعاد عروضها ومشروعاتها من التقارير والتذكيرات"
          : "Test data — exclude related quotes/projects from reports and reminders"}
      </label>
      <button className="csp-button" disabled={!dirty || busy} type="submit">
        {busy
          ? ar
            ? "جارٍ الحفظ…"
            : "Saving…"
          : ar
            ? "حفظ بيانات الإدارة"
            : "Save management data"}
      </button>
      {message && <p role={failed ? "alert" : "status"}>{message}</p>}
    </form>
  );
}
