import { ArrowUpRight, Check, CircleAlert, Clock3, GitBranch } from "lucide-react";
import { shortTime } from "./shared";
import { relationIssues } from "./relations";
import { WORKFLOW_STAGES, workflowState, workflowTimeline } from "./workflow";

export default function WorkflowPanel({
  relations = {},
  language,
  compact = false,
  onOpenRequest,
  onOpenQuote,
  onOpenProject,
  onOpenPayment,
}) {
  const isArabic = language === "ar";
  const state = workflowState(relations, isArabic);
  const events = workflowTimeline(relations, isArabic);
  const issues = relationIssues(relations);
  const activeIndex = Math.max(0, WORKFLOW_STAGES.indexOf(state.stage));
  const links = [
    relations.request && onOpenRequest && {
      key: "request",
      label: isArabic ? "الطلب" : "Brief",
      onClick: () => onOpenRequest(relations.request.id),
    },
    relations.quote && onOpenQuote && {
      key: "quote",
      label: isArabic ? "العرض" : "Quote",
      onClick: () => onOpenQuote(relations.quote.id),
    },
    relations.project && onOpenProject && {
      key: "project",
      label: isArabic ? "المشروع" : "Project",
      onClick: () => onOpenProject(relations.project.id),
    },
    relations.payments?.length > 0 && onOpenPayment && {
      key: "payments",
      label: isArabic ? `الدفعات (${relations.payments.length})` : `Payments (${relations.payments.length})`,
      onClick: () => onOpenPayment(relations.payments[0].id),
    },
  ].filter(Boolean);
  return (
    <section className={`csp-workflow-panel${compact ? " csp-workflow-panel--compact" : ""}`} aria-label={isArabic ? "حالة مسار العمل" : "Workflow status"}>
      <div className="csp-workflow-panel-head">
        <div>
          <span className="csp-details-section-kicker">WORKFLOW / {isArabic ? "المسار" : "CONNECTED FLOW"}</span>
          <strong>{isArabic ? "حالة المسار والخطوة التالية" : "Workflow and next action"}</strong>
        </div>
        <GitBranch size={17} aria-hidden="true" />
      </div>
      <div className="csp-workflow-state-grid">
        <div>
          <span>{isArabic ? "أنت هنا" : "CURRENT STAGE"}</span>
          <strong>{state.stageLabel}</strong>
        </div>
        <div className="csp-workflow-next-action">
          <span>{isArabic ? "الخطوة التالية" : "NEXT ACTION"}</span>
          <strong>{state.next.label}</strong>
        </div>
      </div>
      <div className="csp-workflow-steps" aria-label={isArabic ? "مراحل المسار" : "Workflow stages"}>
        {WORKFLOW_STAGES.map((stage, index) => (
          <span className={`${index < activeIndex ? "is-done" : ""}${index === activeIndex ? " is-current" : ""}`} key={stage}>
            {index < activeIndex ? <Check size={12} /> : <i>{index + 1}</i>}
            {stageLabel(stage, isArabic)}
          </span>
        ))}
      </div>
      {links.length > 0 && (
        <div className="csp-workflow-links" aria-label={isArabic ? "انتقال داخل المسار" : "Connected records"}>
          <span>{isArabic ? "انتقال مباشر" : "CONNECTED RECORDS"}</span>
          <div>
            {links.map((link) => (
              <button type="button" className="csp-button csp-button--quiet" key={link.key} onClick={link.onClick}>
                {link.label}
                <ArrowUpRight size={13} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}
      {issues.length > 0 && (
        <aside className="csp-workflow-integrity" aria-label={isArabic ? "تنبيهات الربط" : "Relation warnings"}>
          <CircleAlert size={16} aria-hidden="true" />
          <div>
            <strong>{isArabic ? "مراجعة الربط مطلوبة" : "Check the connected records"}</strong>
            {issues.map((issue) => <p key={issue.key}>{isArabic ? issue.ar : issue.en}</p>)}
          </div>
        </aside>
      )}
      {!compact && (
        <div className="csp-workflow-timeline">
          <div className="csp-workflow-timeline-head">
            <span>{isArabic ? "السجل الموحد" : "UNIFIED TIMELINE"}</span>
            <small>{events.length ? `${events.length} ${isArabic ? "محطات" : "events"}` : isArabic ? "لا يوجد تاريخ مسجل بعد" : "No recorded events yet"}</small>
          </div>
          {events.length > 0 ? (
            <ol>
              {events.map((event) => (
                <li className={`is-${event.status}`} key={event.key}>
                  <span className="csp-workflow-event-icon" aria-hidden="true">
                    {event.status === "attention" ? <CircleAlert size={13} /> : event.status === "current" ? <Clock3 size={13} /> : <Check size={13} />}
                  </span>
                  <div>
                    <strong>{event.label}</strong>
                    {event.detail && <small>{event.detail}</small>}
                  </div>
                  <time className="csp-sensitive-number">{shortTime(event.date)}</time>
                </li>
              ))}
            </ol>
          ) : (
            <p className="csp-workflow-empty">{isArabic ? "سيظهر التاريخ هنا تلقائيًا مع كل خطوة مرتبطة." : "Connected activity will appear here as the workflow advances."}</p>
          )}
        </div>
      )}
    </section>
  );
}

function stageLabel(stage, isArabic) {
  return {
    brief: isArabic ? "طلب" : "Brief",
    quote: isArabic ? "عرض" : "Quote",
    project: isArabic ? "مشروع" : "Project",
    payment: isArabic ? "تحصيل" : "Collection",
    complete: isArabic ? "مكتمل" : "Complete",
  }[stage] || stage;
}
