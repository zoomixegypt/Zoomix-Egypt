const valueOf = (row, ...keys) => {
  for (const key of keys) {
    if (row?.[key]) return row[key];
  }
  return null;
};

export const WORKFLOW_STAGES = ["brief", "quote", "project", "payment", "complete"];

export function workflowStage(relations = {}) {
  const { quote, project, payments = [] } = relations;
  const quoteStatus = String(quote?.status || "").toLowerCase();
  const projectStatus = String(project?.status || "").toLowerCase();
  const hasPendingPayment = payments.some((payment) => ["pending", "overdue"].includes(String(payment.status || "").toLowerCase()));
  const allPaymentsSettled = payments.length > 0 && payments.every((payment) => ["paid", "cancelled"].includes(String(payment.status || "").toLowerCase()));

  // A draft or revision-requested quote is still the active stage, even if
  // demo/legacy data already contains a project or payment record.
  if (quote && ["draft", "local-draft", "revision_requested"].includes(quoteStatus)) return "quote";
  if (project && hasPendingPayment) return "payment";
  if (
    project &&
    ( ["closed", "delivered", "completed"].includes(projectStatus) ||
      (quoteStatus === "accepted" && allPaymentsSettled) )
  ) {
    return "complete";
  }
  if (project) return "project";
  if (quote) return "quote";
  return "brief";
}

export function workflowStageLabel(stage, isArabic) {
  return {
    brief: isArabic ? "طلب" : "Brief",
    quote: isArabic ? "عرض سعر" : "Quote",
    project: isArabic ? "مشروع" : "Project",
    payment: isArabic ? "تحصيل" : "Collection",
    complete: isArabic ? "مكتمل" : "Complete",
  }[stage] || (isArabic ? "متابعة" : "Follow-up");
}

export function workflowNextAction(relations = {}, isArabic) {
  const { quote, project, payments = [] } = relations;
  if (!quote) return { key: "create_quote", label: isArabic ? "أنشئ عرض السعر المرتبط" : "Create the linked quote" };
  if (["draft", "local-draft"].includes(quote.status)) {
    return { key: "send_quote", label: isArabic ? "أكمل العرض ثم أرسله" : "Finish and send the quote" };
  }
  if (["sent", "viewed", "revision_requested"].includes(quote.status)) {
    return { key: "follow_up", label: isArabic ? "تابع مع العميل" : "Follow up with the client" };
  }
  if (quote.status === "accepted" && !project) {
    return { key: "create_project", label: isArabic ? "حوّل العرض إلى مشروع" : "Hand off to a project" };
  }
  const pendingPayment = payments.find((payment) => ["pending", "overdue"].includes(payment.status));
  if (pendingPayment) {
    return {
      key: pendingPayment.status === "overdue" ? "overdue_payment" : "collect_payment",
      label: pendingPayment.status === "overdue"
        ? isArabic ? "تابع الدفعة المتأخرة" : "Follow up on the overdue payment"
        : isArabic ? "سجّل الدفعة التالية" : "Record the next payment",
    };
  }
  if (project && !["closed", "delivered"].includes(project.status)) {
    return { key: "advance_project", label: isArabic ? "حدّث خطوة التنفيذ" : "Update the delivery step" };
  }
  return { key: "review_record", label: isArabic ? "راجع السجل" : "Review the record" };
}

export function workflowState(relations = {}, isArabic) {
  const stage = workflowStage(relations);
  return {
    stage,
    stageLabel: workflowStageLabel(stage, isArabic),
    next: workflowNextAction(relations, isArabic),
  };
}

export function workflowTimeline(relations = {}, isArabic) {
  const { request, quote, project, payments = [] } = relations;
  const events = [];
  const add = (key, date, label, detail, status = "done") => {
    if (!date) return;
    events.push({ key, date, label, detail, status });
  };
  add(
    "request-created",
    valueOf(request, "createdAt", "created_at"),
    isArabic ? "استلام الطلب" : "Brief received",
    request?.reference_code || "",
  );
  add(
    "quote-created",
    valueOf(quote, "createdAt", "created_at"),
    isArabic ? "إنشاء عرض السعر" : "Quote created",
    quote?.reference || "",
  );
  add(
    `quote-${quote?.lastEvent || quote?.status || "updated"}`,
    valueOf(quote, "lastEventAt", "updatedAt", "updated_at"),
    isArabic ? "آخر تحديث للعرض" : "Latest quote update",
    quote?.lastEvent || quote?.status || "",
    quote?.status === "accepted" ? "done" : "current",
  );
  add(
    "project-created",
    valueOf(project, "createdAt", "created_at"),
    isArabic ? "إنشاء المشروع" : "Project created",
    project?.reference || "",
  );
  payments
    .flatMap((payment) => {
      const date = valueOf(payment, "paidAt", "createdAt", "created_at", "dueAt", "due_at");
      return date
        ? [{
            key: `payment-${payment.id}`,
            date,
            label: payment.status === "paid"
              ? isArabic ? "تحصيل دفعة" : "Payment collected"
              : isArabic ? "استحقاق دفعة" : "Payment due",
            detail: payment.reference || "",
            status: payment.status === "overdue" ? "attention" : payment.status === "paid" ? "done" : "current",
          }]
        : [];
    })
    .forEach((event) => events.push(event));
  return events.sort((left, right) => new Date(left.date) - new Date(right.date));
}
