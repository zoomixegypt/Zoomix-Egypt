import { BarChart3 } from "lucide-react";
import {} from "../../data/commercialStudioPrototype";

import { money, StatusChip, Metric } from "./shared";
export default function ReportsView({ language, quotes, projects, payments }) {
  const isArabic = language === "ar";
  const quoteRows = Array.isArray(quotes) ? quotes : null;
  const projectRows = Array.isArray(projects) ? projects : null;
  const paymentRows = Array.isArray(payments) ? payments : null;
  const quoteList = quoteRows || [];
  const projectList = projectRows || [];
  const paymentList = paymentRows || [];
  const waiting = !quoteRows || !projectRows || !paymentRows;
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
      <section className="csp-metrics-grid">
        <Metric
          label={isArabic ? "نسبة التحويل" : "CONVERSION"}
          value={quoteRows ? `${conversion}%` : "—"}
          note={isArabic ? "المقبول من العروض غير المسودة · آخر 200" : "Accepted / non-drafts · latest 200"}
          accent
        />
        <Metric
          label={isArabic ? "قيمة التعاقدات" : "CONTRACT VALUE"}
          value={projectRows ? money(revenue) : "—"}
          note={isArabic ? "جنيه · تشمل الضريبة" : "EGP · including tax"}
        />
        <Metric
          label={isArabic ? "الربح المتوقع" : "EXPECTED PROFIT"}
          value={projectRows ? money(profit) : "—"}
          note="EGP"
        />
        <Metric
          label={isArabic ? "المحصل" : "COLLECTED"}
          value={paymentRows ? money(collected) : "—"}
          note="EGP"
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
