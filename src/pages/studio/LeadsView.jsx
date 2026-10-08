import { FileText, Users } from "lucide-react";
import { useState } from "react";
import { briefLabel, safeDate } from "./briefs";
import {} from "../../data/commercialStudioPrototype";

import { StatusChip } from "./shared";
export default function LeadsView({ language, requests, onCreateQuote }) {
  const isArabic = language === "ar";
  const rows = Array.isArray(requests) ? requests : [];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
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
        {filtered.map((request) => (
          <article key={request.id}>
            <div
              id={`studio-record-${request.id}`}
              className="csp-table-row csp-leads-row"
              key={request.id}
            >
              <span className="csp-item-name">
                <strong>{request.name}</strong>
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
                {isArabic ? "تفاصيل الطلب كاملة" : "Full brief details"} · {request.reference_code}
              </summary>
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
