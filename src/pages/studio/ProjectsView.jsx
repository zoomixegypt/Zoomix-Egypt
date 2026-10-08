import { FolderKanban } from "lucide-react";
import {} from "../../data/commercialStudioPrototype";

import { money, margin, StatusChip, Metric } from "./shared";
export default function ProjectsView({ language, projects }) {
  const isArabic = language === "ar";
  const rows = Array.isArray(projects) ? projects : null;
  const list = rows || [];
  const waiting = !rows;
  return (
    <div className="csp-view-enter">
      <header className="csp-page-head">
        <div>
          <p className="csp-kicker">DELIVERY / PROJECTS</p>
          <h1>{isArabic ? "المشروعات" : "PROJECTS"}</h1>
          <p className="csp-page-description">
            {isArabic
              ? "المشروعات المؤكدة التي تحولت تلقائيًا من عروض مقبولة."
              : "Confirmed work created automatically from accepted quotes."}
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
          label={isArabic ? "مشروعات نشطة" : "ACTIVE PROJECTS"}
          value={waiting ? "—" : String(list.length)}
          note={isArabic ? "من عروض مقبولة" : "From accepted quotes"}
        />
        <Metric
          label={isArabic ? "قيمة التعاقدات" : "CONTRACT VALUE"}
          value={waiting ? "—" : money(list.reduce((sum, item) => sum + item.contractValue, 0))}
          note="EGP"
        />
        <Metric
          label={isArabic ? "الربح المتوقع" : "EXPECTED PROFIT"}
          value={
            waiting
              ? "—"
              : money(
                  list.reduce(
                    (sum, item) =>
                      sum + (item.netContractValue ?? item.contractValue) - item.expectedCost,
                    0,
                  ),
                )
          }
          note="EGP"
          accent
        />
      </section>
      <section className="csp-panel csp-table-wrap">
        <div className="csp-table-head csp-projects-head">
          <span>{isArabic ? "المشروع" : "Project"}</span>
          <span>{isArabic ? "العميل" : "Client"}</span>
          <span>{isArabic ? "قيمة التعاقد" : "Contract"}</span>
          <span>{isArabic ? "الهامش" : "Margin"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
        </div>
        {list.map((project) => (
          <div
            id={`studio-record-${project.id}`}
            className="csp-table-row csp-projects-row"
            key={project.id}
          >
            <span className="csp-item-name">
              <strong>{project.projectName}</strong>
              <small>{project.reference}</small>
            </span>
            <span>{project.clientName}</span>
            <b className="csp-sensitive-number">{money(project.contractValue)} EGP</b>
            <span className="csp-sensitive-number">
              {margin(project.netContractValue ?? project.contractValue, project.expectedCost)}%
            </span>
            <StatusChip accent>{project.status}</StatusChip>
          </div>
        ))}
        {rows && !rows.length && (
          <div className="csp-empty-state">
            <FolderKanban />
            <strong>{isArabic ? "لا توجد مشروعات مؤكدة" : "No confirmed projects"}</strong>
            <span>
              {isArabic
                ? "يُنشأ المشروع تلقائيًا بعد قبول العميل للعرض."
                : "A project is created automatically when a client accepts a quote."}
            </span>
          </div>
        )}
        {waiting && (
          <div className="csp-empty-state">
            <FolderKanban />
            <strong>{isArabic ? "بانتظار ربط القاعدة" : "Awaiting database"}</strong>
            <span>
              {isArabic
                ? "الأرقام وتقييم المشروعات تتاح بعد ربط القاعدة."
                : "Project figures become available after connecting the database."}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
