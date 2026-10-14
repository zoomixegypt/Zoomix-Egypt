const byId = (rows, id) =>
  (Array.isArray(rows) ? rows : []).find((row) => String(row?.id) === String(id)) || null;

const newest = (rows) =>
  [...(Array.isArray(rows) ? rows : [])].sort(
    (left, right) =>
      new Date(right?.updatedAt || right?.updated_at || right?.createdAt || 0) -
      new Date(left?.updatedAt || left?.updated_at || left?.createdAt || 0),
  )[0] || null;

export function quoteForRequest(request, quotes) {
  if (!request) return null;
  return newest(
    (Array.isArray(quotes) ? quotes : []).filter(
      (quote) => String(quote?.briefRequestId ?? quote?.brief_request_id) === String(request.id),
    ),
  );
}

export function projectForQuote(quote, projects) {
  if (!quote) return null;
  return byId(
    Array.isArray(projects) ? projects : [],
    (Array.isArray(projects) ? projects : []).find(
      (project) => String(project?.quoteId ?? project?.quote_id) === String(quote.id),
    )?.id,
  );
}

export function paymentsForProject(project, payments) {
  if (!project) return [];
  return (Array.isArray(payments) ? payments : []).filter(
    (payment) => String(payment?.projectId ?? payment?.project_id) === String(project.id),
  );
}

export function projectForPayment(payment, projects) {
  if (!payment) return null;
  return byId(projects, payment.projectId ?? payment.project_id);
}

export function quoteForPayment(payment, projects, quotes) {
  const project = projectForPayment(payment, projects);
  return byId(quotes, project?.quoteId ?? project?.quote_id ?? payment?.quoteId ?? payment?.quote_id);
}

export function requestRelations(request, { quotes, projects, payments } = {}) {
  const quote = quoteForRequest(request, quotes);
  const project = projectForQuote(quote, projects);
  return { request, quote, project, payments: paymentsForProject(project, payments) };
}

export function quoteRelations(quote, { requests, projects, payments } = {}) {
  const request = byId(requests, quote?.briefRequestId ?? quote?.brief_request_id);
  const project = projectForQuote(quote, projects);
  return { quote, request, project, payments: paymentsForProject(project, payments) };
}

export function projectRelations(project, { quotes, requests, payments } = {}) {
  const quote = byId(quotes, project?.quoteId ?? project?.quote_id);
  const request = byId(requests, quote?.briefRequestId ?? quote?.brief_request_id);
  return { project, quote, request, payments: paymentsForProject(project, payments) };
}

export function paymentRelations(payment, { projects, quotes, requests } = {}) {
  const project = projectForPayment(payment, projects);
  const quote = byId(quotes, project?.quoteId ?? project?.quote_id ?? payment?.quoteId ?? payment?.quote_id);
  const request = byId(requests, quote?.briefRequestId ?? quote?.brief_request_id ?? payment?.briefRequestId ?? payment?.brief_request_id);
  return { payment, project, quote, request };
}

export function relationIssues(relations = {}) {
  const { request, quote, project, payment } = relations;
  const issues = [];
  if (quote && (quote.briefRequestId || quote.brief_request_id) && !request) {
    issues.push({
      key: "quote-request",
      ar: "العرض مرتبط بطلب غير موجود.",
      en: "This quote points to a missing brief.",
    });
  }
  if (project && (project.quoteId || project.quote_id) && !quote) {
    issues.push({
      key: "project-quote",
      ar: "المشروع مرتبط بعرض غير موجود.",
      en: "This project points to a missing quote.",
    });
  }
  if (payment && (payment.projectId || payment.project_id) && !project) {
    issues.push({
      key: "payment-project",
      ar: "الدفعة مرتبطة بمشروع غير موجود.",
      en: "This payment points to a missing project.",
    });
  }
  if (payment && (payment.quoteId || payment.quote_id) && !quote) {
    issues.push({
      key: "payment-quote",
      ar: "الدفعة مرتبطة بعرض غير موجود.",
      en: "This payment points to a missing quote.",
    });
  }
  return issues;
}
