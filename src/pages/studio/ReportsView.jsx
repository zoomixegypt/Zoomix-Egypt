import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { BusinessReport } from "./BusinessWorkspace";
import {} from "../../data/commercialStudioPrototype";

import { money, StatusChip, Metric } from "./shared";

const dateKey = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const rowDate = (row) =>
  row?.createdAt || row?.created_at || row?.updatedAt || row?.updated_at || "";

const rangeFor = (preset, from, to) => {
  if (preset === "custom") return { from, to };
  if (preset === "all") return { from: "", to: "" };
  const days = Number(preset);
  if (!Number.isFinite(days)) return { from: "", to: "" };
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return { from: dateKey(start), to: dateKey(end) };
};

export default function ReportsView({ language, quotes, projects, payments, storageMode }) {
  const isArabic = language === "ar";
  const [rangePreset, setRangePreset] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const range = useMemo(
    () => rangeFor(rangePreset, customFrom, customTo),
    [rangePreset, customFrom, customTo],
  );
  const inRange = (row) => {
    const key = dateKey(rowDate(row));
    if (!key || (!range.from && !range.to)) return true;
    return (!range.from || key >= range.from) && (!range.to || key <= range.to);
  };
  const quoteRows = Array.isArray(quotes) ? quotes : null;
  const projectRows = Array.isArray(projects) ? projects : null;
  const paymentRows = Array.isArray(payments) ? payments : null;
  const quoteList = (quoteRows || []).filter((row) => !row.isTest && inRange(row));
  const projectList = (projectRows || []).filter((row) => !row.isTest && inRange(row));
  const paymentList = (paymentRows || []).filter((row) => !row.isTest && inRange(row));
  const waiting = !quoteRows || !projectRows || !paymentRows;
  const rangeLabel =
    range.from || range.to
      ? `${range.from || "…"} → ${range.to || "…"}`
      : isArabic
        ? "كل الفترة"
        : "All time";
  const metricNote = (definition) =>
    `${definition} · ${isArabic ? "النطاق" : "Range"}: ${rangeLabel}`;
  const accepted = quoteList.filter((item) => item.status === "accepted").length;
  const sent = quoteList.filter((item) => item.status !== "draft").length;
  const conversion = sent ? Math.round((accepted / sent) * 100) : 0;
  const revenue = projectList.reduce((sum, item) => sum + item.contractValue, 0);
  const profit = projectList.reduce(
    (sum, item) => sum + (item.netContractValue ?? item.contractValue) - item.expectedCost,
    0,
  );
  const collected = paymentList
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const stages = [
    ["draft", isArabic ? "مسودة" : "Draft"],
    ["sent", isArabic ? "مرسل" : "Sent"],
    ["viewed", isArabic ? "مشاهدة" : "Viewed"],
    ["revision_requested", isArabic ? "تعديل" : "Revision"],
    ["accepted", isArabic ? "مقبول" : "Accepted"],
  ];
  const max = Math.max(
    1,
    ...stages.map(([status]) => quoteList.filter((item) => item.status === status).length),
  );
  return (
    <div className="csp-view-enter">
      {!waiting && storageMode === "cloud" && (
        <BusinessReport language={language} from={range.from} to={range.to} />
      )}
      <header className="csp-page-head">
        <div>
          <p className="csp-kicker">BUSINESS / INSIGHT</p>
          <h1>{isArabic ? "التقارير" : "REPORTS"}</h1>
          <p className="csp-page-description">
            {isArabic
              ? "صورة مباشرة لمسار المبيعات والربحية والتحصيل."
              : "A live view of pipeline, profitability and collection."}
          </p>
        </div>
      </header>
      {waiting && (
        <p className="csp-mode-note" role="status">
          {isArabic
            ? "الأرقام تتاح بعد ربط القاعدة."
            : "Numbers become available after the database is connected."}
        </p>
      )}
      <section className="csp-panel csp-report-range" aria-labelledby="report-range-title">
        <div className="csp-panel-head">
          <div>
            <p className="csp-kicker">REPORT SCOPE</p>
            <h2 id="report-range-title">{isArabic ? "نطاق التقرير" : "Report range"}</h2>
          </div>
          <StatusChip>{rangeLabel}</StatusChip>
        </div>
        <div className="csp-report-range-controls">
          <label>
            <span>{isArabic ? "الفترة" : "Period"}</span>
            <select value={rangePreset} onChange={(event) => setRangePreset(event.target.value)}>
              <option value="all">{isArabic ? "كل الفترة" : "All time"}</option>
              <option value="7">{isArabic ? "آخر 7 أيام" : "Last 7 days"}</option>
              <option value="30">{isArabic ? "آخر 30 يومًا" : "Last 30 days"}</option>
              <option value="90">{isArabic ? "آخر 90 يومًا" : "Last 90 days"}</option>
              <option value="custom">{isArabic ? "فترة مخصصة" : "Custom range"}</option>
            </select>
          </label>
          {rangePreset === "custom" && (
            <>
              <label>
                <span>{isArabic ? "من" : "From"}</span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                />
              </label>
              <label>
                <span>{isArabic ? "إلى" : "To"}</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                />
              </label>
            </>
          )}
        </div>
        <p className="csp-mode-note">
          {isArabic
            ? "تُحسب المؤشرات من السجلات غير الاختبارية داخل الفترة المختارة، وتظهر قاعدة الحساب تحت كل مؤشر."
            : "Metrics use non-test records inside the selected period; each metric states its calculation scope."}
        </p>
      </section>
      <section className="csp-metrics-grid">
        <Metric
          label={isArabic ? "نسبة التحويل" : "CONVERSION"}
          value={quoteRows ? `${conversion}%` : "—"}
          note={
            isArabic
              ? metricNote("المقبول من العروض غير المسودة · دون بيانات الاختبار")
              : metricNote("Accepted / non-drafts · excluding test data")
          }
          accent
        />
        <Metric
          label={isArabic ? "قيمة التعاقدات" : "CONTRACT VALUE"}
          value={projectRows ? money(revenue) : "—"}
          note={metricNote(isArabic ? "جنيه · تشمل الضريبة" : "EGP · including tax")}
        />
        <Metric
          label={isArabic ? "الربح المتوقع" : "EXPECTED PROFIT"}
          value={projectRows ? money(profit) : "—"}
          note={metricNote("EGP")}
        />
        <Metric
          label={isArabic ? "المحصل" : "COLLECTED"}
          value={paymentRows ? money(collected) : "—"}
          note={metricNote("EGP")}
        />
      </section>
      <section className="csp-panel csp-report-panel">
        <div className="csp-panel-head">
          <h2>{isArabic ? "مسار عروض الأسعار" : "Quote pipeline"}</h2>
          <StatusChip accent={!!quoteRows}>
            {quoteRows ? "LIVE" : isArabic ? "بانتظار البيانات" : "AWAITING DATA"}
          </StatusChip>
        </div>
        {quoteRows ? (
          stages.map(([status, label]) => {
            const count = quoteList.filter((item) => item.status === status).length;
            return (
              <div className="csp-funnel-row" key={status}>
                <span>{label}</span>
                <i>
                  <b style={{ width: `${(count / max) * 100}%` }} />
                </i>
                <strong className="csp-sensitive-number">{count}</strong>
              </div>
            );
          })
        ) : (
          <div className="csp-empty-state">
            <BarChart3 />
            <strong>{isArabic ? "بانتظار بيانات العروض" : "Awaiting quote data"}</strong>
            <span>
              {isArabic
                ? "مسار العروض يظهر بعد ربط القاعدة."
                : "The quote pipeline appears after the database is connected."}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
